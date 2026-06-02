# Publishing a Plugin

## Naming

| Asset | Convention | Example |
|---|---|---|
| PyPI distribution name | `fastforge-<area>` | `fastforge-stripe` |
| Python import package | `fastforge_<area>` | `fastforge_stripe` |
| Entry-point name (= `fastforge add X`) | short verb | `stripe` |
| Class name | `<Area>Generator` | `StripeGenerator` |
| Capability key (`.fastforge.json`) | usually = entry-point name | `stripe` |

Reserve names by publishing a `0.0.0` placeholder if you plan to ship later.

## Versioning

Two version numbers exist; do not confuse them:

| Version | Source | What it means |
|---|---|---|
| Package version | `pyproject.toml` `[project] version` | What pip installs |
| Generator version | `YourGenerator.version` class attr | What `upgrade()` migrates from/to |

Bump the **generator version** whenever the emitted code shape changes. Bump the **package version** on any release.

Recommended: keep them in sync, but they don't have to be.

## Pre-publish checklist

- [ ] `python3 -m pip install -e .` succeeds in a clean venv
- [ ] `fastforge plugins ls` shows your generator
- [ ] `fastforge add <name>` runs end-to-end on a fresh `fastforge new` project
- [ ] Re-running `fastforge add <name>` is idempotent (no duplicate writes)
- [ ] `validate()` returns `[]` on a successful generation
- [ ] Unit tests cover `emit_inline` happy path + idempotency
- [ ] README has install + usage example
- [ ] `LICENSE` file present (MIT or Apache-2.0 recommended)

## Build and publish

```bash
python3 -m pip install --upgrade build twine
python3 -m build
twine check dist/*
twine upload dist/*
```

For test runs, use TestPyPI:

```bash
twine upload --repository testpypi dist/*
pip install --index-url https://test.pypi.org/simple/ fastforge-stripe
```

## Security expectations

You are shipping code that runs in users' projects. The bar is high.

- **No network calls during `discover_generators()`** — discovery must be fast and offline
- **No `eval`, `exec`, `subprocess` with unvalidated input**
- **No writes outside `project_dir`** (or `lib_dir` for `emit_into_lib`)
- **No reads of user secrets / env vars** beyond what the generator obviously needs
- **Pin dependencies** in `pyproject.toml` with upper bounds
- **Run `pip-audit`** before release
- **Sign your PyPI uploads** with a Trusted Publisher (GitHub OIDC)

## Listing your plugin on the official catalog

Open a PR to https://github.com/VibhuviOiO/fastforge-cli adding your plugin to `docs/plugins.md` with:

- Name, PyPI link, repo link
- One-line description
- Maintainer GitHub handle
- License

The FastForge team reviews for basic quality (idempotency, tests, security) and merges.

## Compatibility policy

- Plugins should declare `fastforge-cli>=X.Y` in their dependencies
- Breaking changes to the `Generator` protocol bump the minor version of `fastforge-cli` and are announced 30 days in advance
- The protocol is considered **stable from `fastforge-cli` 0.1.0 onwards**

## Maintenance

- Tag releases in git (`v0.2.1`) matching the PyPI version
- Use GitHub Actions to publish on tag push (Trusted Publisher)
- Respond to issues within 7 days or mark the repo `unmaintained`
- Drop support for end-of-life Python versions in major releases only
