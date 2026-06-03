# GitHub Label Taxonomy

## Overview

Arbiter Systems repositories use a shared GitHub label taxonomy so backlog triage, implementation ordering, cross-repo planning, and issue cleanup stay consistent as work moves across backend services, public web properties, console work, and organization operations.

For product-facing feature names used in issue titles, docs, demos, and UI labels, use the shared [Arbiter Product Naming Guidance](../product-naming.md). Labels classify work; product names describe user-facing concepts.

## Labels vs. GitHub Project Fields

### Role of Labels

Labels are used for taxonomy, ownership routing, search and filter helpers, and lightweight automation triggers. They help teams classify work consistently across repositories without becoming the execution system of record.

Lane/status helper labels, when used, are governed by the [lane policy](../issue-lane-policy.md) and must not override GitHub Project fields.

### Role of GitHub Project Fields

GitHub Project fields are the operational source of truth for execution management. The [GitHub Project operating model](github-project-operating-model.md) defines how execution state, sequencing, blockers, readiness, confidence, and cross-cutting work context are managed through Project fields rather than labels.

Project-field concepts that belong in Project fields rather than labels include:

- Status
- Lane
- Implementation Order
- Blocked By
- Release Gate
- Validation Command
- Agent
- Last Reviewed
- Confidence
- Implementation Readiness
- Scope Risk
- Project Priority
- Phase
- Workstream

### Do Not Create Labels For Project Field Values

The following values are already represented by named Project fields, and adding labels for them creates two competing sources of truth:

- `status:ready`
- `status:blocked`
- `status:in-progress`
- `scope:low`
- `scope:medium`
- `scope:high`
- `agent:codex`
- `agent:claude`
- `agent:copilot`
- `confidence:high`
- `confidence:medium`
- `confidence:low`
- `implementation-readiness:ready`
- `implementation-readiness:not-ready`
- `release-gate:none`
- `release-gate:local-mvp`
- `validation-command:*`
- `workstream:*`
- `project-priority:*`

## Label Families

Use these label families for active planning and issue triage:

| Family | Purpose | Guidance |
|---|---|---|
| `area/*` | Product or engineering area affected by the issue. | Use when the issue clearly belongs to a cross-cutting area. |
| `component/*` | Local system, repo, or implementation component affected by the issue. | Use when it improves ownership or implementation routing. |
| `phase/*` | Delivery phase or maturity stage. | Use one phase label unless the issue intentionally spans phases. |
| `priority/*` | Relative ordering signal. | Use one priority label per active issue. |
| `type/*` | Work classification. | Use one primary type label per issue. |

## Color Palette

Use this palette for canonical labels across active Arbiter Systems repositories:

| Label Pattern | Color | Description |
|---|---:|---|
| `area/*` | `#1d76db` | Cross-cutting area |
| `component/*` | `#5319e7` | Implementation component |
| `phase/*` | `#0e8a16` | Delivery phase |
| `priority/high` | `#b60205` | Relative ordering signal |
| `priority/medium` | `#fbca04` | Relative ordering signal |
| `priority/low` | `#c2e0c6` | Relative ordering signal |
| `type/*` | `#6f42c1` | Work classification |

## Canonical Labels

### Areas

- `area/architecture`
- `area/ci`
- `area/config`
- `area/console` — console-scoped; may be repo-local to `arbiter-console`
- `area/cost-control`
- `area/demo`
- `area/docs`
- `area/execution`
- `area/governance`
- `area/mvp`
- `area/observability`
- `area/policy`
- `area/privacy`
- `area/provenance`
- `area/providers`
- `area/resilience`
- `area/routing`
- `area/security`
- `area/site` — public-site-scoped; may be repo-local to `arbiter-site`

### Components

- `component/core`
- `component/contracts`
- `component/infrastructure`
- `component/observability`
- `component/ops`
- `component/platform`
- `component/routing`
- `component/startup`

### Phases

- `phase/foundation`
- `phase/hardening`
- `phase/mvp`
- `phase/post-mvp`

### Priorities

- `priority/high`
- `priority/medium`
- `priority/low`

### Types

- `type/feature`
- `type/bug`
- `type/chore`
- `type/docs`
- `type/test`
- `type/epic`

## Stock GitHub Defaults

GitHub default labels are retained for compatibility, but new Arbiter planning issues should prefer canonical `type/*` labels. Use `type/bug` for defects instead of the stock `bug` label when applying the shared taxonomy. Prefer `type/docs` over `documentation` and `type/feature` over `enhancement`.

Existing uses of stock labels should be cleaned up in a separate issue-label cleanup pass.

## Repo Usage Guidance

`area/site` and `area/console` are scoped to specific public-facing repos and may be created locally rather than org-wide:

- `area/site` — use in `arbiter-systems/arbiter-site` only; skip in backend or ops repos.
- `area/console` — use in `arbiter-systems/arbiter-console` only; skip in backend or ops repos.

`component/platform`, `component/core`, `component/routing`, and `component/contracts` already exist in the taxonomy; do not create synonyms or duplicates.

| Repository | Common Labels |
|---|---|
| `arbiter-systems/control-plane-api` | `area/execution`, `area/config`, `area/observability`, `area/providers`, `area/security`, `area/routing`, `area/policy`, `area/privacy`, `area/resilience`, `area/cost-control`, `area/mvp`, `component/core`, `component/startup`, `component/routing`, `component/contracts`, `component/infrastructure` |
| `arbiter-systems/ai-execution-service` | `area/execution`, `area/observability`, `area/security`, `area/routing`, `area/resilience`, `area/mvp`, `component/core`, `component/contracts`, `component/infrastructure` |
| `arbiter-systems/.github` | `area/docs`, `area/ci`, `area/governance`, `area/architecture`, `component/ops`, `component/platform` |
| `arbiter-systems/arbiter-site` | `area/docs`, `area/ci`, `area/site`, `area/demo`, `component/platform`, `component/infrastructure` |
| `arbiter-systems/arbiter-console` | `area/observability`, `area/governance`, `area/console`, `area/demo`, `component/platform`, `component/core` |
| `arbiter-systems/company` | `area/governance`, `area/provenance`, `area/docs`, `area/architecture`, `area/mvp`, `type/epic`, `component/ops` |

## Examples

- Execution trace sink issue in `control-plane-api`:
  `type/feature`, `priority/high`, `phase/mvp`, `area/execution`, `area/observability`, `component/core`

- Defect in firewall policy evaluation in `control-plane-api`:
  `type/bug`, `priority/high`, `phase/mvp`, `area/execution`, `area/policy`, `component/core`

- Documentation-only roadmap update in `.github`:
  `type/docs`, `priority/medium`, `phase/foundation`, `area/docs`, `area/architecture`, `component/ops`

- Console execution trace detail screen in `arbiter-console`:
  `type/feature`, `priority/medium`, `phase/mvp`, `area/console`, `area/observability`, `component/core`

- Post-MVP semantic routing work deferred from active sprint:
  `type/feature`, `priority/low`, `phase/post-mvp`, `area/routing`, `area/resilience`, `component/routing`

## Product Naming Examples

Product-facing issue titles should use the vocabulary in [Arbiter Product Naming Guidance](../product-naming.md) when the issue affects user-facing behavior, docs, demos, or UI labels.

Examples:

- `docs(site): explain Floodgate surge controls in public copy`
- `feat(console): add Decision Record panel to Execution Receipt view`
- `docs(product): document Black Box evidence and Execution Receipt structure`
- `feat(api): add Damage Report fields to execution summary`

## Triage Rules

- Prefer existing canonical labels over new near-synonyms.
- Avoid duplicate labels with the same meaning, such as both `docs` and `area/docs`.
- Use one `priority/*` label per issue.
- Use one `phase/*` label per issue unless an issue intentionally spans multiple phases.
- Use `area/*` and `component/*` labels only when they improve routing or implementation clarity.
- Do not use labels as milestone substitutes.
- Do not rewrite issue titles or bodies only to perform label cleanup.
- Do not change branch protections, milestones, or implementation scope as part of label cleanup.

## New Issue Checklist

- [ ] Add one `type/*` label.
- [ ] Add one `priority/*` label when ordering matters.
- [ ] Add one `phase/*` label for roadmap or MVP sequencing work.
- [ ] Add `area/*` labels for cross-cutting ownership.
- [ ] Add `component/*` labels for implementation routing.
- [ ] Avoid creating a new label unless the existing taxonomy cannot represent the issue.

## Intentionally Deferred

Deferred / out of scope for routine label cleanup:

- Milestone reclassification.
- Issue title rewrites.
- Issue body rewrites.
- Branch protection changes.
- Automation for label creation or issue triage.
- Broad reclassification where the active issue scope is ambiguous.
