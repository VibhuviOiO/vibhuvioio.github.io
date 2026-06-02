# Plugin Protocol Reference

Every FastForge generator implements the `Generator` protocol from `fastforge.generator_protocol`. This page is the complete contract.

## Import surface

```python
from fastforge.generator_protocol import (
    Generator,           # the Protocol (use for type hints)
    BaseGenerator,       # convenience base class with safe defaults
    ENTRY_POINT_GROUP,   # = "fastforge.generators"
    discover_generators, # returns dict[str, Generator]
    get_generator,       # returns Generator | None
    list_generators,     # returns list[tuple[str, str, str]]
)
```

## Properties (all required)

| Property | Type | Purpose |
|---|---|---|
| `name` | `str` | Short kebab-case name. Must match entry-point name. |
| `version` | `str` | Semver string of the generator implementation (not the package). |
| `description` | `str` | One-line summary for `fastforge plugins ls`. |
| `capability_key` | `str` | Key this generator owns in `.fastforge.json`. |
| `delegatable` | `bool` | Whether `emit_delegated` is supported. Defaults to `True` in `BaseGenerator`. |

## Methods

### `emit_inline(project_dir, args) -> dict` — **required**

Generate code directly into the user's project.

- **`project_dir`**: absolute `Path` to the FastForge project root
- **`args`**: dict of user-supplied options (e.g. `{"port": 8000}`)
- **Returns**: `{"status": "ok" | "already_configured", "created": [str], "modified": [str]}`
- **Idempotency**: required. Re-running must not duplicate writes.

### `emit_delegated(project_dir, lib, args) -> dict` — optional

Generate thin wire-up code that imports from a shared platform library.

- Only invoked when the project's `kind="app"` and a `platform_lib` is configured
- If unsupported, raise `NotImplementedError` (the `BaseGenerator` default does this)

### `emit_into_lib(lib_dir, args) -> dict` — optional

Generate the *implementation* into a shared platform library (the inverse of `emit_delegated`).

- Only invoked when the project's `kind="lib"`
- Same return shape as `emit_inline`

### `upgrade(project_dir, from_version) -> dict` — optional

Apply forward-only deltas from `from_version` to `self.version`.

- **Returns**: `{"status": "upgraded" | "no_change", "changes": [str]}`
- Default in `BaseGenerator`: returns `{"status": "no_change", "changes": []}`

### `validate(project_dir) -> list[str]` — optional

Health check. Powers `fastforge doctor`.

- **Returns**: list of warning/error strings. Empty list = healthy.
- Default in `BaseGenerator`: returns `[]`

### `capability_schema() -> dict` — recommended

Return a JSON-schema fragment describing what this generator writes into `.fastforge.json`.

- Used to validate the project config and detect drift via `fastforge audit`
- Default in `BaseGenerator`: returns `{}`

## Return shape contract

All emit methods return the same shape:

```python
{
    "status": "ok",                  # required
    "created": ["app/foo.py", ...],  # files newly written, project-relative
    "modified": [".env.example"],    # existing files mutated, project-relative
}
```

Other allowed `status` values:

- `"already_configured"` — capability already present, no-op
- Anything else is treated as an error by the CLI

## Discovery contract

`discover_generators()` is called on every CLI invocation:

1. Reads the `fastforge.generators` entry-point group
2. Instantiates classes; uses instances as-is
3. On `ImportError` or any exception during load → logs to stderr and **skips that plugin**
4. Returns `dict[name, instance]`

**Implication**: a buggy plugin cannot break the CLI for users. But you should still test your `__init__` against `python -c "from fastforge_yours.generator import YoursGenerator; YoursGenerator()"`.

## Minimal valid plugin

```python
from pathlib import Path
from typing import Any
from fastforge.generator_protocol import BaseGenerator


class HelloGenerator(BaseGenerator):
    name = "hello"
    version = "0.1.0"
    description = "Adds a hello.txt file"
    capability_key = "hello"

    def emit_inline(self, project_dir: Path, args: dict[str, Any]) -> dict[str, Any]:
        target = project_dir / "hello.txt"
        if target.exists():
            return {"status": "already_configured", "created": [], "modified": []}
        target.write_text("hello from a plugin\n")
        return {"status": "ok", "created": ["hello.txt"], "modified": []}
```

`pyproject.toml`:

```toml
[project.entry-points."fastforge.generators"]
hello = "your_pkg.generator:HelloGenerator"
```

That's the entire contract.
