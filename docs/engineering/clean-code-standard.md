# Clean Code Standard

## Purpose

This standard defines concise expectations for readable, maintainable Arbiter code and documentation changes.

## Required practices

- Keep functions, classes, pages, and modules focused on one clear responsibility.
- Use names that describe intent, not implementation trivia.
- Prefer simple control flow over clever abstractions.
- Keep public contracts stable unless the issue explicitly changes them.
- Keep behavior changes separate from broad formatting churn.
- Avoid hidden global state and implicit cross-module coupling.
- Preserve existing repository style unless a scoped issue approves a change.

## Avoid

- Drive-by refactors unrelated to the issue.
- Large helper layers that are not used by the current change.
- Ambiguous names such as `data`, `item`, or `manager` when domain names are available.
- Comments that restate obvious code instead of explaining intent or tradeoffs.
- Weakening validation, errors, or assertions to make a change easier.

## Completion check

Before calling work complete, confirm the change is scoped, readable, reviewable, and validated by the repository's documented commands.
