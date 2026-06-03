# Cross-Repo Authority Map

## Purpose

This map identifies which document is authoritative when guidance overlaps across Arbiter Systems repositories, and which repository owns each documentation domain. Humans and agents should read it before resolving cross-repo documentation, label, project-field, copy, or agent-instruction conflicts.

## Authority Map

| Topic | Authority Document | Location | Notes |
| --- | --- | --- | --- |
| GitHub Project field semantics, execution state, and conflict resolution | github-project-operating-model.md | docs/operations/github-project-operating-model.md | Field wins over label when they disagree. |
| Issue metadata block keys and allowed values for automated hydration | project-field-hydration.md | docs/project-field-hydration.md | Metadata values must match GitHub Project field option values, not label taxonomy values. |
| Label taxonomy, family definitions, and repo-level label usage | github-label-taxonomy.md | docs/operations/github-label-taxonomy.md | Labels are taxonomy and routing aids; they do not override GitHub Project fields. |
| Repo-local implementation behavior and agent instructions | each repo's own AGENTS.md | AGENTS.md in the relevant repository | .github/AGENTS.md governs this repo only; implementation repositories own their own AGENTS.md. |

## Cross-Repo Scope Boundaries

| Repository | Owns | Does Not Own |
| --- | --- | --- |
| .github | shared operating model, label taxonomy, GitHub Project field hydration docs, issue lane policy | product source code, service contracts, private roadmap |
| control-plane-api / ai-execution-service | service-local runtime docs and implemented API contracts | operating model, label definitions, public copy governance |
| arbiter-site | public-safe site copy and buyer-facing docs | implementation details, private roadmap |
| arbiter-console | frontend/operator-console setup and scope docs | operating model, backend contracts |
| company | confidential long-term strategy and private roadmap material only | public-facing documentation, service contracts, implementation source |

## Conflict Resolution Rules

- When a GitHub Project field and a label disagree, the GitHub Project field is authoritative.
- When a repo-local AGENTS.md conflicts with .github/AGENTS.md, the repo-local AGENTS.md governs behavior inside that repo.
- Do not copy company content into public repos without explicit sanitization and human approval.

## Related Documents

- [AGENTS.md](../AGENTS.md)
- [github-project-operating-model.md](operations/github-project-operating-model.md)
- [github-label-taxonomy.md](operations/github-label-taxonomy.md)
- [project-field-hydration.md](project-field-hydration.md)
- [issue-lane-policy.md](issue-lane-policy.md)
