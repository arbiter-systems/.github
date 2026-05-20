# Milestone and Release Tag Strategy

## Purpose

Milestones represent release targets, not categories or labels. Milestones set buyer-facing checkpoints. Release Gate and Phase Project fields control per-issue sequencing. This document defines pre-production checkpoint conventions only.

## Milestone Definitions

| Milestone | Scope summary | Release Gate value | Phase value | Authority doc |
|---|---|---|---|---|
| Local MVP | Local, two-service MVP checkpoint for first end-to-end validation. | `local-mvp` | `mvp` | [MVP sellable completion gate](mvp-sellable-completion-gate.md) |
| Hosted Demo | Hosted, buyer-facing demo checkpoint and readiness bar. | `hosted-demo` | `hosted-demo` | [MVP sellable completion gate](mvp-sellable-completion-gate.md) |
| Customer Pilot | Pilot-readiness checkpoint aligned to MVP dependencies. | `customer-pilot` | `customer-pilot` | [MVP dependency map](../project/mvp-dependency-map.md) |
| Post-MVP | Planning bucket for work after customer-pilot readiness. | `post-mvp` | `post-mvp` | [Issue lane policy](../issue-lane-policy.md) |
| Deferred | Parking bucket for intentionally deferred issues. | `none` | `N/A` | [Issue lane policy](../issue-lane-policy.md) |

## Relationship Mapping

Milestones coordinate release targets and buyer-facing checkpoints. They should remain stable and human-owned.

### GitHub Project Release Gate Field

The Release Gate field is the per-issue gate value used for sequencing inside the project. Milestones are release target groupings for reporting and roll-up. Do not create labels to mirror Release Gate values.

Note: Deferred work is not an active release gate. Deferred issues should use `Release Gate = none` and remain governed by lane/status promotion rules.

### Project Phase Field and `phase/*` Labels

The Project Phase field is authoritative for delivery phase. `phase/*` labels are routing/filtering complements. When they disagree, the Project field wins.

### Priority Labels and Project Priority

Issue priority labels are orthogonal to milestone placement. Priority does not determine milestone assignment. Project Priority remains the authoritative Project field for execution priority.

### Release-Readiness Checklists

A milestone is not closed until the relevant authority doc gate is satisfied.

### Deferred Issues

Deferred issues must not appear in Local MVP, Hosted Demo, or Customer Pilot milestones unless explicitly promoted according to [Issue lane policy](../issue-lane-policy.md).

### Roadmap and Architecture Epics

Epics may span milestones. Milestone assignment on an epic tracks the earliest release target for that epic's deliverables, not the epic's full scope.

## Release Tag Naming

| Checkpoint | Tag | Meaning |
|---|---|---|
| Local MVP | `v0.1.0-local-mvp` | Local two-service demo validated. |
| Hosted Demo | `v0.2.0-hosted-demo` | Hosted buyer-facing checkpoint cleared. |
| Customer Pilot | `v0.3.0-customer-pilot` | Customer-pilot readiness gate cleared. |

Tags are created after the milestone's validation gate passes, not when the milestone is opened or when the final issue closes. A tag without a passing gate is not valid. This document does not define semantic versioning policy for production or post-pilot releases. This document does not create Git tags or GitHub Releases.

## Future GitHub Release Notes

Future GitHub Release notes for these checkpoint tags should include:
- Completed issues closed under the milestone.
- Validation gate status: `pass` or `accepted-with-known-gaps`.
- Known limitations and deferred features explicitly not included.
- Security and privacy posture as of the tag, referencing [GitHub security baseline matrix](github-security-baseline-matrix.md) without restating its content.
- Demo readiness statement where applicable.
- Explicit statement that the release does not imply production readiness, compliance certification, or customer-facing SLA.

Do not create release-note automation as part of this strategy.

## Non-Goals

This document does not cover release automation, changelog generation automation, deployment automation, package or image publishing, production semantic versioning policy, or a customer-facing release/support process.

## Related Documents

- [GitHub Project operating model](github-project-operating-model.md)
- [Issue lane policy](../issue-lane-policy.md)
- [GitHub label taxonomy](github-label-taxonomy.md)
- [MVP sellable completion gate](mvp-sellable-completion-gate.md)
- [MVP dependency map](../project/mvp-dependency-map.md)
- [GitHub security baseline matrix](github-security-baseline-matrix.md)
