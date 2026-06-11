# Project Field Hydration Retirement

Project field hydration is retired for normal Arbiter Systems execution planning.

## Status

Do not use project field hydration for routine planning metadata.

Use instead:

- issue body sections for scope, validation, blockers, and readiness
- labels for type, priority, phase, repo, area, and status
- milestones for release grouping
- manual weekly triage for implementation ordering

## Rationale

Project field hydration made GitHub Projects behave like a metadata database. That added Actions cost and operational complexity without directly improving code quality or delivery throughput.

## Replacement mapping

| Retired field / automation | Replacement |
| --- | --- |
| Workstream | `area/*` labels |
| Phase | `phase/*` labels and milestones |
| Release Gate | milestones or issue body |
| Confidence | issue discussion when needed |
| Scope Risk | issue discussion when needed |
| Implementation Order | weekly triage ranking |
| Blocked By | `## Blocked by` issue links plus `status/blocked` |
| Validation Command | `## Validation` issue body section |
| Implementation Readiness | ready checklist plus `status/ready` |

## Retired workflows

The reusable and manual workflows remain only as explanatory no-op workflows so callers fail safe while repositories transition away from field hydration.

## Historical scripts

The historical scripts are retained temporarily for audit/reference only:

- `scripts/hydrate-project-fields.cjs`
- `scripts/batch-project-field-hydration.cjs`
- `scripts/hydrate-project-fields.test.cjs`

Do not wire these back into repository workflows without creating a new issue explaining why field hydration is required again.
