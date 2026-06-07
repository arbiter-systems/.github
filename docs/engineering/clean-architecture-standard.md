# Clean Architecture Standard

## Purpose

This standard defines high-level architecture expectations for Arbiter repositories without exposing private service internals.

## Required practices

- Keep business rules separate from framework glue, transport code, and UI shell code.
- Keep controllers, route handlers, pages, and command entry points thin.
- Put reusable decisions and domain behavior in explicit services, models, or modules.
- Use adapters at external boundaries such as databases, providers, APIs, queues, files, and vendor SDKs.
- Keep dependencies pointing inward toward stable domain contracts where practical.
- Avoid circular dependencies.
- Keep error handling and validation explicit at the boundary that owns them.
- Preserve repository ownership boundaries; do not invent behavior owned by another repo.

## Avoid

- Infrastructure details leaking into core contracts.
- UI copy or public docs implying backend behavior that is not implemented.
- Shared abstractions before at least two real use cases need them.
- Cross-repo coupling through undocumented assumptions.
- Architectural rewrites inside small feature or docs issues.

## Completion check

Before calling work complete, confirm the change preserves ownership boundaries and keeps new architecture proportional to the issue scope.
