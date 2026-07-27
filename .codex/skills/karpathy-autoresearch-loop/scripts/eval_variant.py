#!/usr/bin/env python3
"""Run one manifest-authoritative AutoResearch evaluator variant.

The v4 contract deliberately keeps evaluator configuration out of the CLI. A
candidate is measured only after its baseline pair, evaluator bundle, runtime,
environment, hypothesis, and editable surface have been validated.
"""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import math
import os
import platform
import re
import signal
import statistics
import subprocess
import sys
import time
from collections.abc import Callable, Iterator
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, TextIO

try:
    import fcntl
except ImportError:  # pragma: no cover - Windows fallback
    fcntl = None  # type: ignore[assignment]


SCHEMA_VERSION = 4
OUTPUT_TAIL_LIMIT = 2_000
DEFAULT_OUTPUT = ".autoresearch/experiments.jsonl"
EXPERIMENT_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
ENVIRONMENT_KEY_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")


class ContractError(ValueError):
    """Raised when an evaluator or experiment violates the frozen contract."""


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Record a v4 baseline or compare a candidate using only manifest settings."
    )
    parser.add_argument("--experiment-id", required=True, help="Stable ID shared by the pair.")
    parser.add_argument("--label", choices=("baseline", "candidate"), required=True)
    parser.add_argument("--hypothesis", required=True)
    parser.add_argument(
        "--surface",
        action="append",
        required=True,
        metavar="REPO_PATH",
        help="Repo-contained editable path. Repeat for each file or directory.",
    )
    parser.add_argument(
        "--manifest",
        required=True,
        help="Repo-contained schema-v4 evaluator manifest.",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help="Direct child JSONL file under .autoresearch/.",
    )
    args = parser.parse_args(argv)

    if not EXPERIMENT_ID_PATTERN.fullmatch(args.experiment_id):
        parser.error("--experiment-id must use letters, digits, dot, underscore, or hyphen")
    if not args.hypothesis.strip():
        parser.error("--hypothesis must not be blank")
    return args


def reject_json_constant(value: str) -> None:
    raise ContractError(f"non-standard JSON numeric constant is not allowed: {value}")


def canonical_json(value: Any) -> str:
    return json.dumps(
        value,
        allow_nan=False,
        ensure_ascii=True,
        separators=(",", ":"),
        sort_keys=True,
    )


def sha256_json(value: Any) -> str:
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ContractError(f"{label} must be an object")
    return value


def require_nonempty_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip() or "\0" in value:
        raise ContractError(f"{label} must be a non-empty string without NUL bytes")
    return value


def require_finite_number(
    value: Any,
    label: str,
    *,
    minimum: float | None = None,
    strictly_positive: bool = False,
) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ContractError(f"{label} must be a finite number")
    result = float(value)
    if not math.isfinite(result):
        raise ContractError(f"{label} must be finite")
    if strictly_positive and result <= 0:
        raise ContractError(f"{label} must be > 0")
    if minimum is not None and result < minimum:
        raise ContractError(f"{label} must be >= {minimum:g}")
    return result


def require_positive_integer(value: Any, label: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise ContractError(f"{label} must be an integer >= 1")
    return value


def repo_root(start: Path | None = None) -> Path:
    proc = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        cwd=start or Path.cwd(),
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0 or not proc.stdout.strip():
        raise ContractError("eval_variant.py must run inside a Git repository")
    return Path(proc.stdout.strip()).resolve(strict=True)


def repo_relative_path(
    root: Path,
    raw_path: str,
    label: str,
    *,
    must_exist: bool,
    require_file: bool = False,
    require_directory: bool = False,
    allow_root: bool = False,
) -> tuple[Path, str]:
    require_nonempty_string(raw_path, label)
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = root / candidate
    try:
        resolved = candidate.resolve(strict=must_exist)
        relative = resolved.relative_to(root)
    except (OSError, ValueError) as exc:
        raise ContractError(f"{label} must stay inside the repository: {raw_path}") from exc

    if not allow_root and relative == Path("."):
        raise ContractError(f"{label} may not be the repository root")
    if require_file and not resolved.is_file():
        raise ContractError(f"{label} must be an existing file: {raw_path}")
    if require_directory and not resolved.is_dir():
        raise ContractError(f"{label} must be an existing directory: {raw_path}")
    return resolved, relative.as_posix()


def resolve_output_path(root: Path, raw_path: str) -> Path:
    require_nonempty_string(raw_path, "--output")
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = root / candidate
    resolved = candidate.resolve(strict=False)
    allowed_parent = (root / ".autoresearch").resolve(strict=False)
    if resolved.suffix != ".jsonl" or resolved.parent != allowed_parent:
        raise ContractError("--output must be a direct .jsonl child of repository .autoresearch/")
    try:
        resolved.relative_to(root)
    except ValueError as exc:
        raise ContractError("--output must stay inside the repository") from exc
    if resolved.exists() and not resolved.is_file():
        raise ContractError("--output must name a regular file")
    return resolved


def parse_environment(value: Any, label: str) -> dict[str, Any]:
    environment = require_object(value, label)
    required = {"inherit", "set"}
    if set(environment) != required:
        raise ContractError(f"{label} must contain exactly: inherit, set")

    inherit = environment["inherit"]
    if not isinstance(inherit, list) or not all(isinstance(item, str) for item in inherit):
        raise ContractError(f"{label}.inherit must be an array of environment variable names")
    if len(inherit) != len(set(inherit)):
        raise ContractError(f"{label}.inherit contains duplicate names")
    for key in inherit:
        if not ENVIRONMENT_KEY_PATTERN.fullmatch(key):
            raise ContractError(f"{label}.inherit contains an invalid name: {key!r}")

    set_values = require_object(environment["set"], f"{label}.set")
    for key, value_item in set_values.items():
        if not ENVIRONMENT_KEY_PATTERN.fullmatch(key):
            raise ContractError(f"{label}.set contains an invalid name: {key!r}")
        if not isinstance(value_item, str) or "\0" in value_item:
            raise ContractError(f"{label}.set values must be strings without NUL bytes")
    overlap = sorted(set(inherit).intersection(set_values))
    if overlap:
        raise ContractError(f"{label} may not both inherit and set: {', '.join(overlap)}")

    return {
        "inherit": sorted(inherit),
        "set": {key: set_values[key] for key in sorted(set_values)},
    }


def parse_task(
    value: Any,
    root: Path,
    label: str,
    *,
    gate: bool,
) -> dict[str, Any]:
    task = require_object(value, label)
    required = {"command", "repeat", "timeoutSeconds", "cwd", "environment"}
    if gate:
        required.add("id")
    if set(task) != required:
        raise ContractError(f"{label} must contain exactly: {', '.join(sorted(required))}")

    command = task["command"]
    if not isinstance(command, list) or not command:
        raise ContractError(f"{label}.command must be a non-empty argv array")
    parsed_command = [
        require_nonempty_string(item, f"{label}.command[{index}]")
        for index, item in enumerate(command)
    ]
    repeat = require_positive_integer(task["repeat"], f"{label}.repeat")
    timeout = require_finite_number(
        task["timeoutSeconds"],
        f"{label}.timeoutSeconds",
        strictly_positive=True,
    )
    _, cwd = repo_relative_path(
        root,
        require_nonempty_string(task["cwd"], f"{label}.cwd"),
        f"{label}.cwd",
        must_exist=True,
        require_directory=True,
        allow_root=True,
    )
    result: dict[str, Any] = {
        "command": parsed_command,
        "repeat": repeat,
        "timeout_seconds": timeout,
        "cwd": cwd,
        "environment": parse_environment(task["environment"], f"{label}.environment"),
    }
    if gate:
        result["id"] = require_nonempty_string(task["id"], f"{label}.id")
    return result


def load_evaluator(
    root: Path,
    raw_manifest_path: str,
    runner_path: Path,
) -> dict[str, Any]:
    manifest_path, manifest_relative = repo_relative_path(
        root,
        raw_manifest_path,
        "--manifest",
        must_exist=True,
        require_file=True,
    )
    try:
        manifest_bytes = manifest_path.read_bytes()
        manifest = json.loads(
            manifest_bytes,
            parse_constant=reject_json_constant,
        )
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, ContractError) as exc:
        raise ContractError(f"cannot read evaluator manifest {manifest_relative}: {exc}") from exc
    manifest = require_object(manifest, "manifest")

    if manifest.get("schemaVersion") != SCHEMA_VERSION:
        raise ContractError(f"manifest schemaVersion must be {SCHEMA_VERSION}")
    evaluator_id = require_nonempty_string(manifest.get("id"), "manifest.id")
    version = require_positive_integer(manifest.get("version"), "manifest.version")

    metric = require_object(manifest.get("primaryMetric"), "manifest.primaryMetric")
    metric_required = {"name", "direction", "epsilon", "target", "regex"}
    if set(metric) != metric_required:
        raise ContractError(
            "manifest.primaryMetric must contain exactly: "
            + ", ".join(sorted(metric_required))
        )
    metric_name = require_nonempty_string(metric["name"], "manifest.primaryMetric.name")
    direction = metric["direction"]
    if direction not in {"higher", "lower"}:
        raise ContractError("manifest.primaryMetric.direction must be higher or lower")
    epsilon = require_finite_number(
        metric["epsilon"],
        "manifest.primaryMetric.epsilon",
        minimum=0,
    )
    target = require_finite_number(metric["target"], "manifest.primaryMetric.target")
    metric_regex = require_nonempty_string(metric["regex"], "manifest.primaryMetric.regex")
    try:
        compiled_metric = re.compile(metric_regex, re.MULTILINE)
    except re.error as exc:
        raise ContractError(f"manifest.primaryMetric.regex is invalid: {exc}") from exc
    if compiled_metric.groups != 1:
        raise ContractError("manifest.primaryMetric.regex must contain exactly one capture group")

    execution = parse_task(manifest.get("execution"), root, "manifest.execution", gate=False)
    raw_gates = manifest.get("gates")
    if not isinstance(raw_gates, list) or not raw_gates:
        raise ContractError("manifest.gates must be a non-empty array")
    gates = [
        parse_task(value, root, f"manifest.gates[{index}]", gate=True)
        for index, value in enumerate(raw_gates)
    ]
    gate_ids = [gate_item["id"] for gate_item in gates]
    if len(gate_ids) != len(set(gate_ids)):
        raise ContractError("manifest.gates contains duplicate ids")

    fixture_files = manifest.get("fixtureFiles")
    if not isinstance(fixture_files, list) or not fixture_files:
        raise ContractError("manifest.fixtureFiles must be a non-empty array")
    if not all(isinstance(item, str) for item in fixture_files):
        raise ContractError("manifest.fixtureFiles must contain only path strings")
    if len(fixture_files) != len(set(fixture_files)):
        raise ContractError("manifest.fixtureFiles contains duplicate paths")

    fixture_paths: list[tuple[str, Path]] = []
    for index, raw_fixture in enumerate(fixture_files):
        if Path(raw_fixture).is_absolute():
            raise ContractError(
                f"manifest.fixtureFiles[{index}] must be repository-relative"
            )
        fixture_path, fixture_relative = repo_relative_path(
            root,
            raw_fixture,
            f"manifest.fixtureFiles[{index}]",
            must_exist=True,
            require_file=True,
        )
        fixture_paths.append((fixture_relative, fixture_path))

    digest = hashlib.sha256()

    def add_bundle_file(kind: bytes, name: str, content: bytes) -> None:
        digest.update(kind)
        digest.update(b"\0")
        digest.update(name.encode("utf-8"))
        digest.update(b"\0")
        digest.update(content)
        digest.update(b"\0")

    add_bundle_file(b"manifest", manifest_relative, manifest_bytes)
    for relative, fixture_path in sorted(fixture_paths):
        add_bundle_file(b"fixture", relative, fixture_path.read_bytes())
    add_bundle_file(b"runner", "eval_variant.py", runner_path.read_bytes())

    normalized = {
        "schema_version": SCHEMA_VERSION,
        "id": evaluator_id,
        "version": version,
        "manifest": manifest_relative,
        "primary_metric": {
            "name": metric_name,
            "direction": direction,
            "epsilon": epsilon,
            "target": target,
            "regex": metric_regex,
        },
        "execution": execution,
        "gates": gates,
        "fixture_files": sorted(relative for relative, _ in fixture_paths),
    }
    normalized["configuration_hash"] = sha256_json(normalized)
    normalized["bundle_hash"] = digest.hexdigest()
    normalized["compiled_metric"] = compiled_metric
    return normalized


def resolve_environment(specification: dict[str, Any]) -> tuple[dict[str, str], dict[str, Any]]:
    resolved = {
        key: os.environ[key]
        for key in specification["inherit"]
        if key in os.environ
    }
    resolved.update(specification["set"])
    missing = sorted(key for key in specification["inherit"] if key not in os.environ)
    metadata = {
        "hash": sha256_json(resolved),
        "inherited_present": sorted(
            key for key in specification["inherit"] if key in os.environ
        ),
        "inherited_missing": missing,
        "set_keys": sorted(specification["set"]),
    }
    return resolved, metadata


def resolve_task_runtime(
    root: Path,
    evaluator: dict[str, Any],
) -> tuple[dict[str, tuple[Path, dict[str, str]]], dict[str, Any]]:
    tasks = [("primary", evaluator["execution"])] + [
        (f"gate:{gate['id']}", gate) for gate in evaluator["gates"]
    ]
    resolved: dict[str, tuple[Path, dict[str, str]]] = {}
    metadata: dict[str, Any] = {}
    for task_name, task in tasks:
        cwd = (root / task["cwd"]).resolve(strict=True)
        environment, environment_metadata = resolve_environment(task["environment"])
        resolved[task_name] = (cwd, environment)
        metadata[task_name] = environment_metadata
    return resolved, {
        "hash": sha256_json({key: value["hash"] for key, value in sorted(metadata.items())}),
        "tasks": metadata,
    }


def as_text(value: str | bytes | None) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return value


def kill_process_group(process: subprocess.Popen[str]) -> None:
    if process.poll() is not None:
        return
    if os.name == "posix":
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        return

    # Windows has no killpg equivalent; taskkill /T terminates the child tree.
    subprocess.run(  # pragma: no cover - Windows fallback
        ["taskkill", "/PID", str(process.pid), "/T", "/F"],
        capture_output=True,
        check=False,
        text=True,
    )


def execute_process(
    command: list[str],
    *,
    cwd: Path,
    environment: dict[str, str],
    timeout_seconds: float,
) -> dict[str, Any]:
    started = time.perf_counter()
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            env=environment,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=os.name == "posix",
            creationflags=(
                subprocess.CREATE_NEW_PROCESS_GROUP  # type: ignore[attr-defined]
                if os.name == "nt"
                else 0
            ),
        )
    except OSError as exc:
        return {
            "exit_code": 127,
            "elapsed_seconds": round(time.perf_counter() - started, 3),
            "timed_out": False,
            "stdout": "",
            "stderr": str(exc),
        }

    timed_out = False
    try:
        stdout, stderr = process.communicate(timeout=timeout_seconds)
        exit_code = process.returncode
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        partial_stdout = as_text(exc.stdout)
        partial_stderr = as_text(exc.stderr)
        kill_process_group(process)
        try:
            stdout, stderr = process.communicate(timeout=5)
        except subprocess.TimeoutExpired as final_exc:
            process.kill()
            stdout = as_text(final_exc.stdout) or partial_stdout
            stderr = as_text(final_exc.stderr) or partial_stderr
            if process.stdout is not None:
                process.stdout.close()
            if process.stderr is not None:
                process.stderr.close()
        exit_code = 124

    return {
        "exit_code": exit_code,
        "elapsed_seconds": round(time.perf_counter() - started, 3),
        "timed_out": timed_out,
        "stdout": stdout,
        "stderr": stderr,
    }


def extract_metric(pattern: re.Pattern[str], text: str) -> float:
    matches = list(pattern.finditer(text))
    if len(matches) != 1:
        raise ContractError(
            f"primary metric must match exactly once; observed {len(matches)} matches"
        )
    raw_value = matches[0].group(1).replace(",", "")
    try:
        metric = float(raw_value)
    except ValueError as exc:
        raise ContractError(f"metric capture is not numeric: {raw_value!r}") from exc
    if not math.isfinite(metric):
        raise ContractError("primary metric must be finite")
    return metric


def public_run_result(result: dict[str, Any]) -> dict[str, Any]:
    return {
        "exit_code": result["exit_code"],
        "elapsed_seconds": result["elapsed_seconds"],
        "timed_out": result["timed_out"],
        "stdout_tail": result["stdout"][-OUTPUT_TAIL_LIMIT:],
        "stderr_tail": result["stderr"][-OUTPUT_TAIL_LIMIT:],
    }


def run_primary(
    evaluator: dict[str, Any],
    runtime: tuple[Path, dict[str, str]],
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    task = evaluator["execution"]
    cwd, environment = runtime
    runs: list[dict[str, Any]] = []
    for _ in range(task["repeat"]):
        raw_result = execute_process(
            task["command"],
            cwd=cwd,
            environment=environment,
            timeout_seconds=task["timeout_seconds"],
        )
        result = public_run_result(raw_result)
        try:
            result["metric"] = extract_metric(
                evaluator["compiled_metric"],
                f"{raw_result['stdout']}\n{raw_result['stderr']}",
            )
            result["metric_error"] = None
        except ContractError as exc:
            result["metric"] = None
            result["metric_error"] = str(exc)
        runs.append(result)

    elapsed = [float(run["elapsed_seconds"]) for run in runs]
    metrics = [float(run["metric"]) for run in runs if run["metric"] is not None]
    metric_complete = len(metrics) == len(runs)
    command_success = all(
        run["exit_code"] == 0 and not run["timed_out"] for run in runs
    )
    summary: dict[str, Any] = {
        "success": command_success and metric_complete,
        "command_success": command_success,
        "metric_complete": metric_complete,
        "elapsed_mean": round(statistics.mean(elapsed), 3),
        "elapsed_median": round(statistics.median(elapsed), 3),
    }
    if metrics:
        summary["metric_mean"] = statistics.mean(metrics)
        summary["metric_median"] = statistics.median(metrics)
    return runs, summary


def run_gates(
    evaluator: dict[str, Any],
    task_runtimes: dict[str, tuple[Path, dict[str, str]]],
) -> tuple[list[dict[str, Any]], bool]:
    gate_results: list[dict[str, Any]] = []
    for gate in evaluator["gates"]:
        cwd, environment = task_runtimes[f"gate:{gate['id']}"]
        runs = []
        for _ in range(gate["repeat"]):
            raw_result = execute_process(
                gate["command"],
                cwd=cwd,
                environment=environment,
                timeout_seconds=gate["timeout_seconds"],
            )
            runs.append(public_run_result(raw_result))
        success = all(
            run["exit_code"] == 0 and not run["timed_out"] for run in runs
        )
        gate_results.append({"id": gate["id"], "success": success, "runs": runs})
    return gate_results, all(gate["success"] for gate in gate_results)


def probe_tool(
    command: list[str],
    *,
    cwd: Path,
    environment: dict[str, str],
) -> dict[str, Any]:
    result = execute_process(
        command,
        cwd=cwd,
        environment=environment,
        timeout_seconds=10,
    )
    return {
        "command": command,
        "exit_code": result["exit_code"],
        "timed_out": result["timed_out"],
        "stdout": result["stdout"].strip(),
        "stderr": result["stderr"].strip(),
    }


def runtime_identity(
    root: Path,
    primary_runtime: tuple[Path, dict[str, str]],
    runner_path: Path,
) -> dict[str, Any]:
    cwd, environment = primary_runtime
    identity = {
        "python": {
            "implementation": platform.python_implementation(),
            "version": platform.python_version(),
            "executable": str(Path(sys.executable).resolve()),
        },
        "platform": {
            "system": platform.system(),
            "release": platform.release(),
            "machine": platform.machine(),
        },
        "tools": {
            "node": probe_tool(["node", "--version"], cwd=cwd, environment=environment),
            "npm": probe_tool(["npm", "--version"], cwd=cwd, environment=environment),
        },
        "runner_sha256": hashlib.sha256(runner_path.read_bytes()).hexdigest(),
        "repository": str(root),
    }
    identity["hash"] = sha256_json(identity)
    return identity


def git_command(root: Path, args: list[str]) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(
        ["git", *args],
        cwd=root,
        capture_output=True,
        check=False,
    )


def git_state(root: Path) -> dict[str, Any]:
    sha = git_command(root, ["rev-parse", "HEAD"])
    if sha.returncode != 0:
        raise ContractError("repository must have a committed HEAD before evaluation")
    sha_text = sha.stdout.decode("utf-8", errors="replace").strip()

    diff = git_command(
        root,
        [
            "diff",
            "--binary",
            "--no-ext-diff",
            "HEAD",
            "--",
            ".",
            ":(exclude).autoresearch/*.jsonl",
        ],
    )
    if diff.returncode != 0:
        raise ContractError("could not capture Git worktree diff")
    untracked = git_command(root, ["ls-files", "--others", "--exclude-standard", "-z"])
    if untracked.returncode != 0:
        raise ContractError("could not capture untracked files")

    untracked_paths = []
    for item in untracked.stdout.split(b"\0"):
        if not item:
            continue
        relative = item.decode("utf-8", errors="surrogateescape")
        if relative.startswith(".autoresearch/") and relative.endswith(".jsonl"):
            continue
        untracked_paths.append(relative)

    digest = hashlib.sha256()
    digest.update(b"HEAD\0")
    digest.update(sha_text.encode("ascii"))
    digest.update(b"\0diff\0")
    digest.update(diff.stdout)
    for relative in sorted(untracked_paths):
        path, normalized = repo_relative_path(
            root,
            relative,
            "untracked path",
            must_exist=True,
            require_file=True,
        )
        digest.update(b"\0untracked\0")
        digest.update(normalized.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())

    changed_names = git_command(
        root,
        [
            "diff",
            "--name-only",
            "HEAD",
            "--",
            ".",
            ":(exclude).autoresearch/*.jsonl",
        ],
    )
    tracked_changed_count = (
        len([line for line in changed_names.stdout.splitlines() if line])
        if changed_names.returncode == 0
        else None
    )
    changed_count = (
        tracked_changed_count + len(untracked_paths)
        if tracked_changed_count is not None
        else None
    )
    return {
        "sha": sha_text,
        "dirty": bool(diff.stdout or untracked_paths),
        "changed_path_count": changed_count,
        "worktree_hash": digest.hexdigest(),
    }


def surface_hash(root: Path, raw_paths: list[str]) -> dict[str, Any]:
    normalized_paths: list[str] = []
    resolved_paths: list[tuple[str, Path]] = []
    for index, raw_path in enumerate(raw_paths):
        path, relative = repo_relative_path(
            root,
            raw_path,
            f"--surface[{index}]",
            must_exist=False,
        )
        if relative in normalized_paths:
            raise ContractError(f"duplicate --surface path: {relative}")
        normalized_paths.append(relative)
        resolved_paths.append((relative, path))

    ordered = sorted(resolved_paths)
    digest = hashlib.sha256()
    for relative, path in ordered:
        digest.update(b"\0surface\0")
        digest.update(relative.encode("utf-8"))
        if not path.exists():
            digest.update(b"\0missing\0")
            continue
        if path.is_file():
            digest.update(b"\0file\0")
            digest.update(path.read_bytes())
            continue
        if not path.is_dir():
            raise ContractError(f"surface path must be a file or directory: {relative}")
        digest.update(b"\0directory\0")
        for child in sorted(path.rglob("*")):
            if ".git" in child.parts:
                continue
            try:
                child_resolved = child.resolve(strict=True)
                child_relative = child_resolved.relative_to(root).as_posix()
            except (OSError, ValueError) as exc:
                raise ContractError(
                    f"surface child escapes the repository: {child}"
                ) from exc
            digest.update(b"\0child\0")
            digest.update(child_relative.encode("utf-8"))
            if child_resolved.is_file():
                digest.update(b"\0file\0")
                digest.update(child_resolved.read_bytes())
            elif child_resolved.is_dir():
                digest.update(b"\0directory\0")
    return {
        "paths": [relative for relative, _ in ordered],
        "hash": digest.hexdigest(),
    }


def parse_records_text(text: str, output: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for line_number, line in enumerate(text.splitlines(), start=1):
        if not line.strip():
            continue
        try:
            value = json.loads(line, parse_constant=reject_json_constant)
        except (json.JSONDecodeError, ContractError) as exc:
            raise ContractError(f"invalid JSONL at {output}:{line_number}: {exc}") from exc
        if not isinstance(value, dict):
            raise ContractError(f"JSONL record at {output}:{line_number} must be an object")
        records.append(value)
    return records


@contextlib.contextmanager
def locked_log(output: Path) -> Iterator[tuple[TextIO, list[dict[str, Any]]]]:
    output.parent.mkdir(parents=False, exist_ok=True)
    with output.open("a+", encoding="utf-8") as handle:
        if fcntl is None:  # pragma: no cover - Windows is not a supported lock target yet
            raise ContractError("file locking requires a POSIX runtime")
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        try:
            handle.seek(0)
            records = parse_records_text(handle.read(), output)
            yield handle, records
        finally:
            handle.flush()
            os.fsync(handle.fileno())
            fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


def experiment_records(
    records: list[dict[str, Any]],
    experiment_id: str,
) -> list[dict[str, Any]]:
    return [record for record in records if record.get("experiment_id") == experiment_id]


def find_unique_baseline(
    records: list[dict[str, Any]],
    experiment_id: str,
) -> dict[str, Any]:
    matching = experiment_records(records, experiment_id)
    baselines = [record for record in matching if record.get("label") == "baseline"]
    candidates = [record for record in matching if record.get("label") == "candidate"]
    if len(baselines) != 1:
        raise ContractError(
            f"experiment {experiment_id!r} must have exactly one baseline; "
            f"found {len(baselines)}"
        )
    if candidates:
        raise ContractError(f"experiment {experiment_id!r} already has a candidate record")
    return baselines[0]


def finite_record_metric(record: dict[str, Any], label: str) -> float:
    try:
        value = record["summary"]["metric_median"]
    except (KeyError, TypeError) as exc:
        raise ContractError(f"{label} has no primary metric median") from exc
    return require_finite_number(value, f"{label} metric")


def validate_candidate_pair(
    baseline: dict[str, Any],
    *,
    experiment_id: str,
    hypothesis: str,
    frozen_identity: dict[str, Any],
    surface_paths: list[str],
) -> float:
    if baseline.get("schema_version") != SCHEMA_VERSION:
        raise ContractError("candidate baseline is not a reproducible schema-v4 record")
    if baseline.get("experiment_id") != experiment_id:
        raise ContractError("candidate baseline experiment id changed")
    if baseline.get("hypothesis") != hypothesis:
        raise ContractError("candidate hypothesis differs from baseline")
    if baseline.get("frozen_identity") != frozen_identity:
        raise ContractError("candidate changed the frozen evaluator, runtime, or environment")
    baseline_surface = baseline.get("surface")
    if not isinstance(baseline_surface, dict) or baseline_surface.get("paths") != surface_paths:
        raise ContractError("candidate editable surface differs from baseline")
    return finite_record_metric(baseline, "baseline")


def append_record(
    output: Path,
    record: dict[str, Any],
    validate_locked_records: Callable[[list[dict[str, Any]]], None],
) -> None:
    line = canonical_json(record)
    with locked_log(output) as (handle, records):
        validate_locked_records(records)
        handle.seek(0, os.SEEK_END)
        handle.write(line + "\n")


def public_task(task: dict[str, Any]) -> dict[str, Any]:
    result = {
        "command": task["command"],
        "repeat": task["repeat"],
        "timeout_seconds": task["timeout_seconds"],
        "cwd": task["cwd"],
        "environment": {
            "inherit": task["environment"]["inherit"],
            "set_keys": sorted(task["environment"]["set"]),
        },
    }
    if "id" in task:
        result["id"] = task["id"]
    return result


def standard_json_print(value: Any) -> None:
    print(
        json.dumps(
            value,
            allow_nan=False,
            ensure_ascii=True,
            indent=2,
            sort_keys=True,
        )
    )


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    runner_path = Path(__file__).resolve(strict=True)
    try:
        root = repo_root()
        output = resolve_output_path(root, args.output)
        evaluator = load_evaluator(root, args.manifest, runner_path)
        surface = surface_hash(root, args.surface)
        task_runtimes, environment_identity = resolve_task_runtime(root, evaluator)
        runtime = runtime_identity(root, task_runtimes["primary"], runner_path)
        frozen_identity = {
            "manifest": evaluator["manifest"],
            "evaluator_id": evaluator["id"],
            "evaluator_version": evaluator["version"],
            "bundle_hash": evaluator["bundle_hash"],
            "configuration_hash": evaluator["configuration_hash"],
            "runtime_hash": runtime["hash"],
            "environment_hash": environment_identity["hash"],
        }

        baseline_snapshot: str | None = None
        baseline_metric: float | None = None
        with locked_log(output) as (_, records):
            matching = experiment_records(records, args.experiment_id)
            if args.label == "baseline":
                if matching:
                    raise ContractError(
                        f"experiment {args.experiment_id!r} already exists; "
                        "baseline ids are unique"
                    )
            else:
                baseline = find_unique_baseline(records, args.experiment_id)
                baseline_metric = validate_candidate_pair(
                    baseline,
                    experiment_id=args.experiment_id,
                    hypothesis=args.hypothesis,
                    frozen_identity=frozen_identity,
                    surface_paths=surface["paths"],
                )
                baseline_snapshot = sha256_json(baseline)

        current_git_state = git_state(root)
        primary_runs, summary = run_primary(evaluator, task_runtimes["primary"])
        gates, gates_success = run_gates(evaluator, task_runtimes)
        record: dict[str, Any] = {
            "schema_version": SCHEMA_VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "experiment_id": args.experiment_id,
            "label": args.label,
            "hypothesis": args.hypothesis,
            "surface": surface,
            "manifest": evaluator["manifest"],
            "evaluator": {
                "id": evaluator["id"],
                "version": evaluator["version"],
                "bundle_hash": evaluator["bundle_hash"],
                "configuration_hash": evaluator["configuration_hash"],
                "primary_metric": evaluator["primary_metric"],
                "execution": public_task(evaluator["execution"]),
                "gates": [public_task(gate) for gate in evaluator["gates"]],
            },
            "frozen_identity": frozen_identity,
            "runtime": runtime,
            "environment": environment_identity,
            "git": current_git_state,
            "summary": summary,
            "runs": primary_runs,
            "gates": gates,
            "gates_success": gates_success,
        }

        if args.label == "baseline":
            record["decision"] = "baseline-recorded"

            def validate_baseline_append(records: list[dict[str, Any]]) -> None:
                if experiment_records(records, args.experiment_id):
                    raise ContractError(
                        f"experiment {args.experiment_id!r} appeared during baseline run"
                    )

            append_record(output, record, validate_baseline_append)
            standard_json_print(
                {
                    "decision": record["decision"],
                    "gates_success": gates_success,
                    "summary": summary,
                }
            )
            return 0 if summary["success"] and gates_success else 1

        if baseline_metric is None or baseline_snapshot is None:
            raise ContractError("candidate preflight did not produce a valid baseline")
        candidate_metric = finite_record_metric(record, "candidate")
        direction = evaluator["primary_metric"]["direction"]
        improvement = (
            baseline_metric - candidate_metric
            if direction == "lower"
            else candidate_metric - baseline_metric
        )
        epsilon = evaluator["primary_metric"]["epsilon"]
        adopted = bool(summary["success"]) and gates_success and improvement > epsilon
        record["comparison"] = {
            "baseline_metric": baseline_metric,
            "candidate_metric": candidate_metric,
            "direction": direction,
            "improvement": improvement,
            "epsilon": epsilon,
        }
        record["decision"] = "adopted" if adopted else "rejected"

        def validate_candidate_append(records: list[dict[str, Any]]) -> None:
            baseline = find_unique_baseline(records, args.experiment_id)
            if sha256_json(baseline) != baseline_snapshot:
                raise ContractError("baseline changed while candidate evaluator was running")

        append_record(output, record, validate_candidate_append)
        standard_json_print(
            {
                "comparison": record["comparison"],
                "decision": record["decision"],
                "gates_success": gates_success,
                "summary": summary,
            }
        )
        return 0 if adopted else 1
    except ContractError as exc:
        print(f"contract error: {exc}", file=sys.stderr)
        return 2
    except (OSError, UnicodeDecodeError) as exc:
        print(f"runner error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
