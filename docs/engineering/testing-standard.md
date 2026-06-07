# Testing Standard

## Purpose

This standard defines concise testing expectations for Arbiter changes.

## Required practices

- Add or update tests for changed behavior when the repository has a relevant test path.
- Keep tests deterministic and independent of call order, wall-clock timing, network availability, and live third-party services unless the issue explicitly scopes integration validation.
- Cover meaningful negative and error paths when behavior can fail.
- Preserve contract tests for service boundaries, public APIs, schemas, and wire formats when those contracts change.
- Prefer small focused tests over broad tests that hide the failing behavior.
- Keep test names descriptive enough to explain the behavior under review.
- Do not weaken assertions just to make CI pass.

## Documentation-only changes

For documentation-only changes, manual Markdown review is acceptable unless the repository has docs validation commands.

## Avoid

- Tests that depend on secrets, real customer data, raw prompts, or live provider credentials.
- Snapshot updates without reviewing what changed.
- Removing tests without replacing or justifying the lost coverage.
- Broad test rewrites unrelated to the issue.

## Completion check

Before calling work complete, report which validation commands were run, which tests changed, and any validation that was skipped with the reason.
