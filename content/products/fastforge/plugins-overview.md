# Plugins Overview

FastForge is built around a plugin system. Every generator — including the built-in `ai-app` — is registered the same way: via the Python entry-point group `fastforge.generators`.

This means:

- Anyone can publish a generator to PyPI
- Users install it with `pip install fastforge-<your-plugin>`
- It shows up in `fastforge plugins ls` immediately
- It works with `fastforge add <name>` like a built-in

## Architecture

```
                ┌──────────────────────────────┐
                │       fastforge CLI          │
                └──────────────┬───────────────┘
                               │
                ┌──────────────▼───────────────┐
                │  discover_generators()       │
                │  reads "fastforge.generators"│
                │  entry-point group           │
                └──────────────┬───────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐      ┌──────────────┐       ┌──────────────┐
│ ai-app       │      │ fastforge-   │       │ your-plugin  │
│ (built-in)   │      │ stripe       │       │              │
└──────────────┘      └──────────────┘       └──────────────┘
```

## What a plugin can do

A plugin is a Python class implementing the `Generator` protocol. It can:

1. **`emit_inline`** — generate code directly into the user's project
2. **`emit_delegated`** — generate thin wire-up that imports from a shared platform library
3. **`emit_into_lib`** — generate the implementation into a shared platform library
4. **`upgrade`** — apply forward deltas when a user runs `fastforge upgrade`
5. **`validate`** — health-check the generated state
6. **`capability_schema`** — declare what it writes into `.fastforge.json`

Most plugins only need `emit_inline` + `capability_schema`. The other methods are opt-in.

## Discovery rules

- Plugins are discovered at every CLI invocation (no caching)
- A broken plugin (import error, etc.) is logged to stderr and skipped — it never crashes the CLI
- Plugin name = entry-point name = what the user types after `fastforge add`
- Versions are reported by the plugin itself (the `version` property), not by the package version

## Listing installed plugins

```bash
fastforge plugins ls
```

Output:

```
                             Discovered Generators
┏━━━━━━━━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Name             ┃ Version ┃ Description                                     ┃
┡━━━━━━━━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ ai-app           │ 1.0.0   │ AI infrastructure: gateway, embeddings, ...    │
│ fastforge-stripe │ 0.2.1   │ Stripe billing and webhook scaffolding         │
└──────────────────┴─────────┴─────────────────────────────────────────────────┘
```

## Next

- [Authoring a plugin](authoring-a-plugin) — full tutorial with working code
- [Plugin protocol reference](plugin-reference) — every method, every return shape
- [Publishing a plugin](publishing-a-plugin) — pyproject, PyPI, naming, versioning
