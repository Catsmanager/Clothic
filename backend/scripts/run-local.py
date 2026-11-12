"""Load backend/.env.local without shell evaluation, then run the Maven Wrapper."""

import os
from pathlib import Path
import re


root = Path(__file__).resolve().parents[1]
path = root / ".env.local"
values = {}
if path.exists():
    for number, line in enumerate(path.read_text().splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        match = re.fullmatch(r"([A-Z][A-Z0-9_]*)=(.*)", line)
        if not match:
            raise SystemExit(f"Invalid environment assignment on line {number}")
        key, value = match.groups()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        values[key] = value

# Explicit process variables take precedence. Never print values from the local file.
env = {**values, **os.environ}
env.setdefault("SERVER_ADDRESS", "127.0.0.1")
env.setdefault("SERVER_PORT", "18080")
os.chdir(root)
os.execve(str(root / "mvnw"), [str(root / "mvnw"), "spring-boot:run"], env)
