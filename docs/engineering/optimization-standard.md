# Optimization Standard

## Purpose

This standard keeps optimization work useful, measurable, and scoped.

## Required practices

- Prefer correctness, clarity, and maintainability before optimization.
- Optimize only when the issue identifies a performance, cost, reliability, or repeated-work concern.
- Focus optimization on measurable hot paths, excessive allocation, blocking I/O, unnecessary retries, redundant external calls, avoidable rendering work, or repeated expensive computation.
- Preserve behavior unless the issue explicitly changes it.
- Add or update tests when optimized behavior could change output, ordering, error handling, or timing assumptions.
- Document the tradeoff when an optimization makes code more complex.

## Avoid

- Premature caching.
- Unscoped concurrency or background work.
- Global mutable caches without clear invalidation.
- Optimizing demo or documentation code in ways that reduce readability.
- Replacing simple code with complex patterns without measured need.

## Completion check

Before calling optimization work complete, confirm the reason, behavior impact, validation, and tradeoffs are clear in the PR summary.
