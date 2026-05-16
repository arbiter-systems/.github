# GitHub Label Taxonomy

## Overview

Arbiter Systems repositories use a shared GitHub label taxonomy so backlog triage, implementation ordering, cross-repo planning, and issue cleanup stay consistent as work moves across backend services, public web properties, console work, and organization operations.

## Label Families

Use these label families for active planning and issue triage:

| Family | Purpose | Guidance |
|---|---|---|
| `area/*` | Product or engineering area affected by the issue. | Use when the issue clearly belongs to a cross-cutting area. |
| `component/*` | Local system, repo, or implementation component affected by the issue. | Use when it improves ownership or implementation routing. |
| `phase/*` | Delivery phase or maturity stage. | Use one phase label unless the issue intentionally spans phases. |
| `priority/*` | Relative ordering signal. | Use one priority label per active issue. |
| `type/*` | Work classification. | Use one primary type label per issue. |

## Canonical Labels

### Areas

- `area/execution`
- `area/docs`
- `area/config`
- `area/security`
- `area/observability`
- `area/providers`
- `area/governance`
- `area/provenance`
- `area/ci`

### Components

- `component/core`
- `component/ops`
- `component/startup`
- `component/routing`
- `component/contracts`
- `component/infrastructure`
- `component/platform`

### Phases

- `phase/foundation`
- `phase/hardening`

### Priorities

- `priority/high`
- `priority/medium`
- `priority/low`

### Types

- `type/feature`
- `type/chore`
- `type/docs`
- `type/test`
- `type/epic`

## Repo Usage Guidance

| Repository | Common Labels |
|---|---|
| `arbiter-systems/control-plane-api` | `area/execution`, `area/config`, `area/observability`, `area/providers`, `area/security`, `component/core`, `component/startup`, `component/routing`, `component/contracts`, `component/infrastructure` |
| `arbiter-systems/ai-execution-service` | `area/execution`, `area/observability`, `area/security`, `component/core`, `component/contracts`, `component/infrastructure` |
| `arbiter-systems/.github` | `area/docs`, `area/ci`, `area/governance`, `component/ops`, `component/platform` |
| `arbiter-systems/arbiter-site` | `area/docs`, `area/ci`, `component/platform`, `component/infrastructure` |
| `arbiter-systems/arbiter-console` | `area/observability`, `area/governance`, `component/platform`, `component/core` |
| `arbiter-systems/internal-roadmap` | `area/governance`, `area/provenance`, `area/docs`, `type/epic`, `component/ops` |

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
