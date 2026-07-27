#!/usr/bin/env python3
"""Regression tests for the schema-v4 evaluator runner."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from typing import Any


RUNNER = Path(__file__).with_name("eval_variant.py").resolve()


class EvalVariantTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory(
            prefix="clothic-eval-variant-",
            dir="/private/tmp",
        )
        self.root = Path(self.temporary.name)
        (self.root / "HARNESS").mkdir()
        (self.root / ".autoresearch").mkdir()
        self.surface = self.root / "surface.txt"
        self.surface.write_text("0\n", encoding="utf-8")
        (self.root / "fixture.txt").write_text("frozen\n", encoding="utf-8")
        (self.root / "metric.py").write_text(
            """
import os
from pathlib import Path
import subprocess
import sys
import time

Path("executed.log").write_text("yes", encoding="utf-8")
mode = Path("surface.txt").read_text(encoding="utf-8").strip()
if mode == "missing":
    print("no metric")
elif mode == "multiple":
    print("SCORE=1")
    print("SCORE=2")
elif mode == "infinite":
    print("SCORE=Infinity")
elif mode == "timeout":
    subprocess.Popen([
        sys.executable,
        "-c",
        "import time; from pathlib import Path; time.sleep(0.8); "
        "Path('child-survived.txt').write_text('bad', encoding='utf-8')",
    ])
    time.sleep(30)
elif mode == "gate-fail":
    print("SCORE=1")
else:
    print(f"SCORE={os.environ.get('ATTACK_SCORE', mode)}")
""".lstrip(),
            encoding="utf-8",
        )
        (self.root / "gate.py").write_text(
            """
from pathlib import Path
import sys

if Path("surface.txt").read_text(encoding="utf-8").strip() == "gate-fail":
    sys.exit(1)
""".lstrip(),
            encoding="utf-8",
        )
        self.manifest_path = self.root / "HARNESS" / "evaluator-v4.json"
        self.write_manifest()
        self.git("init", "-q")
        self.git("config", "user.email", "runner-test@example.invalid")
        self.git("config", "user.name", "Runner Test")
        self.git("add", ".")
        self.git("commit", "-q", "-m", "fixture")

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def git(self, *args: str) -> None:
        subprocess.run(["git", *args], cwd=self.root, check=True, capture_output=True)

    def write_manifest(self, timeout: float = 2) -> None:
        environment = {"inherit": ["PATH"], "set": {"TZ": "UTC"}}
        manifest = {
            "schemaVersion": 4,
            "id": "runner-regression-v4",
            "version": 4,
            "primaryMetric": {
                "name": "score",
                "direction": "higher",
                "epsilon": 0,
                "target": 1,
                "regex": r"(?m)^SCORE=([^\s]+)$",
            },
            "execution": {
                "command": [sys.executable, "metric.py"],
                "repeat": 1,
                "timeoutSeconds": timeout,
                "cwd": ".",
                "environment": environment,
            },
            "gates": [
                {
                    "id": "known-gate",
                    "command": [sys.executable, "gate.py"],
                    "repeat": 1,
                    "timeoutSeconds": 2,
                    "cwd": ".",
                    "environment": environment,
                }
            ],
            "fixtureFiles": ["fixture.txt", "gate.py", "metric.py"],
        }
        self.manifest_path.write_text(
            json.dumps(manifest, indent=2) + "\n",
            encoding="utf-8",
        )

    def run_variant(
        self,
        label: str,
        experiment_id: str,
        *,
        output: str = ".autoresearch/experiments.jsonl",
        manifest: Path | None = None,
    ) -> subprocess.CompletedProcess[str]:
        environment = os.environ.copy()
        environment["ATTACK_SCORE"] = "99"
        environment["PYTHONDONTWRITEBYTECODE"] = "1"
        return subprocess.run(
            [
                sys.executable,
                str(RUNNER),
                "--experiment-id",
                experiment_id,
                "--label",
                label,
                "--hypothesis",
                "candidate raises the frozen score",
                "--surface",
                "surface.txt",
                "--manifest",
                str(manifest or self.manifest_path),
                "--output",
                output,
            ],
            cwd=self.root,
            env=environment,
            text=True,
            capture_output=True,
            check=False,
        )

    def records(self) -> list[dict[str, Any]]:
        output = self.root / ".autoresearch" / "experiments.jsonl"
        return [
            json.loads(line)
            for line in output.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]

    def test_known_pass_pair_uses_manifest_environment_and_is_adopted(self) -> None:
        baseline = self.run_variant("baseline", "known-pass")
        self.assertEqual(baseline.returncode, 0, baseline.stderr)
        self.surface.write_text("1\n", encoding="utf-8")
        candidate = self.run_variant("candidate", "known-pass")
        self.assertEqual(candidate.returncode, 0, candidate.stderr)

        records = self.records()
        self.assertEqual([record["decision"] for record in records], ["baseline-recorded", "adopted"])
        self.assertEqual(records[0]["summary"]["metric_median"], 0)
        self.assertEqual(records[1]["summary"]["metric_median"], 1)
        self.assertIn("worktree_hash", records[1]["git"])
        self.assertIn("hash", records[1]["runtime"])
        self.assertIn("hash", records[1]["surface"])

    def test_gate_failure_rejects_an_improving_candidate(self) -> None:
        self.assertEqual(self.run_variant("baseline", "gate-fail").returncode, 0)
        self.surface.write_text("gate-fail\n", encoding="utf-8")
        candidate = self.run_variant("candidate", "gate-fail")
        self.assertEqual(candidate.returncode, 1, candidate.stderr)
        record = self.records()[-1]
        self.assertEqual(record["decision"], "rejected")
        self.assertFalse(record["gates_success"])

    def test_candidate_pair_is_validated_before_command_execution(self) -> None:
        self.assertEqual(self.run_variant("baseline", "fixture-drift").returncode, 0)
        (self.root / "executed.log").unlink()
        (self.root / "fixture.txt").write_text("changed\n", encoding="utf-8")
        self.surface.write_text("1\n", encoding="utf-8")

        candidate = self.run_variant("candidate", "fixture-drift")
        self.assertEqual(candidate.returncode, 2)
        self.assertFalse((self.root / "executed.log").exists())
        self.assertEqual(len(self.records()), 1)

    def test_missing_multiple_and_nonfinite_metrics_fail(self) -> None:
        for mode in ("missing", "multiple", "infinite"):
            with self.subTest(mode=mode):
                self.surface.write_text(f"{mode}\n", encoding="utf-8")
                result = self.run_variant("baseline", f"bad-{mode}")
                self.assertEqual(result.returncode, 1, result.stderr)
                record = self.records()[-1]
                self.assertFalse(record["summary"]["metric_complete"])
                self.assertIsNone(record["runs"][0]["metric"])
        for line in (self.root / ".autoresearch" / "experiments.jsonl").read_text(
            encoding="utf-8"
        ).splitlines():
            json.loads(line, parse_constant=lambda value: self.fail(f"non-standard JSON: {value}"))

    def test_timeout_kills_the_process_group(self) -> None:
        self.write_manifest(timeout=0.2)
        self.git("add", "HARNESS/evaluator-v4.json")
        self.git("commit", "-q", "-m", "short timeout")
        self.surface.write_text("timeout\n", encoding="utf-8")
        result = self.run_variant("baseline", "timeout")
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertTrue(self.records()[-1]["runs"][0]["timed_out"])
        time.sleep(1)
        self.assertFalse((self.root / "child-survived.txt").exists())

    def test_output_escape_and_duplicate_baseline_fail_before_execution(self) -> None:
        escaped = self.run_variant("baseline", "escape", output="../escape.jsonl")
        self.assertEqual(escaped.returncode, 2)
        self.assertFalse((self.root.parent / "escape.jsonl").exists())

        self.assertEqual(self.run_variant("baseline", "unique").returncode, 0)
        (self.root / "executed.log").unlink()
        duplicate = self.run_variant("baseline", "unique")
        self.assertEqual(duplicate.returncode, 2)
        self.assertFalse((self.root / "executed.log").exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
