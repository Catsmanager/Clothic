#!/usr/bin/env python3
"""Run a fixed evaluator repeatedly and append a compact JSONL result."""

from __future__ import annotations

import argparse
import json
import re
import statistics
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Measure a baseline or candidate command for an AutoResearch loop."
    )
    parser.add_argument("--label", required=True, help="Variant label, e.g. baseline or candidate.")
    parser.add_argument("--repeat", type=int, default=1, help="Number of times to run the command.")
    parser.add_argument(
        "--output",
        default=".autoresearch/experiments.jsonl",
        help="JSONL file to append results to.",
    )
    parser.add_argument(
        "--metric-regex",
        help="Regex with one numeric capture group to extract the primary metric from output.",
    )
    parser.add_argument(
        "--lower-is-better",
        action="store_true",
        help="Annotate extracted metrics as lower-is-better.",
    )
    parser.add_argument("command", nargs=argparse.REMAINDER, help="Command after --")
    args = parser.parse_args()
    if args.repeat < 1:
        parser.error("--repeat must be >= 1")
    if args.command and args.command[0] == "--":
        args.command = args.command[1:]
    if not args.command:
        parser.error("command is required after --")
    return args


def extract_metric(pattern: str | None, text: str) -> float | None:
    if not pattern:
        return None
    match = re.search(pattern, text, re.MULTILINE)
    if not match:
        return None
    value = match.group(1)
    try:
        return float(value.replace(",", ""))
    except ValueError as exc:
        raise ValueError(f"metric capture is not numeric: {value!r}") from exc


def run_once(command: list[str], metric_regex: str | None) -> dict[str, object]:
    started = time.perf_counter()
    proc = subprocess.run(command, text=True, capture_output=True)
    elapsed = time.perf_counter() - started
    combined = f"{proc.stdout}\n{proc.stderr}"
    return {
        "exit_code": proc.returncode,
        "elapsed_seconds": round(elapsed, 3),
        "metric": extract_metric(metric_regex, combined),
        "stdout_tail": proc.stdout[-2000:],
        "stderr_tail": proc.stderr[-2000:],
    }


def summarize(runs: list[dict[str, object]]) -> dict[str, object]:
    elapsed = [float(run["elapsed_seconds"]) for run in runs]
    metrics = [run["metric"] for run in runs if run["metric"] is not None]
    summary: dict[str, object] = {
        "success": all(run["exit_code"] == 0 for run in runs),
        "elapsed_mean": round(statistics.mean(elapsed), 3),
        "elapsed_median": round(statistics.median(elapsed), 3),
    }
    if metrics:
        numeric_metrics = [float(metric) for metric in metrics]
        summary["metric_mean"] = statistics.mean(numeric_metrics)
        summary["metric_median"] = statistics.median(numeric_metrics)
    return summary


def main() -> int:
    args = parse_args()
    runs = [run_once(args.command, args.metric_regex) for _ in range(args.repeat)]
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "label": args.label,
        "command": args.command,
        "repeat": args.repeat,
        "lower_is_better": args.lower_is_better,
        "summary": summarize(runs),
        "runs": runs,
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=True) + "\n")

    print(json.dumps(record["summary"], indent=2, ensure_ascii=True))
    return 0 if record["summary"]["success"] else 1


if __name__ == "__main__":
    sys.exit(main())
