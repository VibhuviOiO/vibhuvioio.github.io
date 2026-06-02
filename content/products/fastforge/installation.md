# Installation

## From PyPI

```bash
pip install fastforge-cli
```

This installs the `fastforge` command and the `python -m fastforge.cli` module entry point.

## From local source (development)

Use this when you are working on FastForge itself or want to validate a release candidate before publishing.

```bash
git clone https://github.com/VibhuviOiO/fastforge-cli.git
cd fastforge-cli

python3 -m pip uninstall -y fastforge-cli
rm -rf build dist *.egg-info __pycache__
python3 -m pip install -e .

fastforge --help
```

## Requirements

- Python 3.10+
- Docker Desktop (for local stack runs)
- Optional: VS Code with the Python extension (for debug compose attach)

## PATH warning fix

If pip warns the `fastforge` script is not on PATH, either:

1. Add the Python bin dir to PATH in your shell profile, or
2. Always run with `python3 -m fastforge.cli ...`

## Verify

```bash
fastforge --help
fastforge plugins ls
```

You should see at least the built-in `ai-app` generator listed.
