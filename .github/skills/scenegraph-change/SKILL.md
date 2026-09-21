---
name: scenegraph-change
description: "Use when changing Unity SceneGraph TOML export, parsing, component constraints, ClusterScript analysis, fixtures, or cross-package integration."
---

# SceneGraph Change Workflow

1. Identify whether the change owns the Unity exporter, TOML parser/schema, TypeScript parser, rules, validator, CLI, or CI.
2. Read `docs/repository-guide.md`, `docs/architecture/data-flow.md`, and `docs/schema/scene-graph-toml.md` before changing a cross-package contract.
3. Keep the smallest compatible change. Preserve existing TOML keys unless an ADR describes the migration.
4. Add a focused fixture or test for the changed behavior. Include a negative case when the change affects static analysis.
5. For exporter changes, verify full export and selected/delta export separately.
6. For analyzer changes, run `npm run verify` in `packages/ts-analyzer`.
7. Update the schema document, roadmap, or ADR when behavior or compatibility changes.
8. Report the changed contract, tests run, and any Unity-only validation that was unavailable.
