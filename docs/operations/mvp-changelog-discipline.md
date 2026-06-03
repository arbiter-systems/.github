# Lightweight MVP Changelog Discipline

Status: shared process guidance  
Scope: active Arbiter Systems repositories during MVP development

## Purpose

Use a lightweight changelog convention so notable product, behavior, security, privacy, release, and demo-readiness changes are captured consistently across active repositories without introducing release automation too early.

This process supports demo readiness, customer/investor credibility, issue traceability, and future release discipline.

## Repositories recommended for adoption

Start with:

- `arbiter-systems/control-plane-api`
- `arbiter-systems/ai-execution-service`
- `arbiter-systems/arbiter-console`
- `arbiter-systems/arbiter-site`

The `.github` repository owns this shared convention. Repo-specific adoption should happen through small follow-up issues or PRs if direct `CHANGELOG.md` files are desired.

## Starter `CHANGELOG.md` template

```md
# Changelog

All notable changes to this project will be documented in this file.

This project follows a lightweight release-log format during MVP development.

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

### Security
- 
```

## Categories

Use these categories during MVP:

| Category | Use for |
| --- | --- |
| `Added` | New features, docs, fixtures, endpoints, demo scenarios, or visible capabilities. |
| `Changed` | Behavior changes, configuration changes, renamed concepts, or compatibility adjustments. |
| `Fixed` | Bug fixes, test fixes, broken docs links, incorrect examples, or regressions. |
| `Security` | Secret handling, logging safety, auth behavior, privacy, prompt-retention, dependency, or vulnerability-related changes. |

Keep entries short and specific. Link to issues or PRs where useful.

## What counts as notable

Update the changelog for changes that affect:

- execution behavior
- public API contracts
- internal service contracts when they affect compatibility
- NDJSON/SSE streaming behavior
- provider routing, readiness, fallback, retry, or circuit-breaker behavior
- policy decisions or governance receipt behavior
- prompt privacy, prompt retention, or logging behavior
- cost-control or waste-reduction behavior
- console/demo behavior
- public site copy or claim guardrails
- deployment or configuration expectations
- security posture or sensitive-data handling
- demo scenario outputs or deterministic fixtures

## What does not need a changelog entry

A changelog entry is usually not needed for:

- internal refactors with no behavior change
- formatting-only edits
- typo fixes that do not affect user-facing or operator-facing meaning
- test-only cleanup with no behavior change
- dependency lockfile changes with no security or runtime impact
- issue metadata or label-only changes

When in doubt, add a short entry. It is easier to remove noise during review than to reconstruct missing release context later.

## PR guidance

A PR should update the repo changelog when it introduces a notable change. The PR summary should mention the changelog entry when included.

Suggested PR note:

```md
## Changelog

- Updated `CHANGELOG.md` under `Unreleased > Added` for the new Provider Readiness demo behavior.
```

If no changelog entry is needed, use:

```md
## Changelog

- Not required: internal refactor only; no behavior, API, docs, security, privacy, or demo impact.
```

## Issue guidance

Implementation issues should call out changelog expectations when the work is likely notable.

Example:

```md
## Changelog expectation

Update `CHANGELOG.md` under `Unreleased > Changed` because this modifies retry suppression behavior.
```

## MVP examples

### Execution behavior

```md
### Changed
- Updated execution admission failure handling to return a safe ProblemDetails response with correlation metadata.
```

### Provider readiness

```md
### Added
- Added Provider Readiness demo state for unhealthy-provider skip scenarios.
```

### Prompt privacy

```md
### Security
- Documented metadata-first receipt behavior and prohibited raw prompts in public fixtures.
```

### Public site claims

```md
### Changed
- Updated public site copy to avoid guaranteed cost-savings and production-readiness claims.
```

## Adoption process

1. Add `CHANGELOG.md` to a repo using the starter template.
2. Keep entries under `[Unreleased]` during MVP development.
3. Use PR review to check whether notable changes were captured.
4. Move entries into dated sections later only when a formal release process exists.
5. Do not introduce automated release tooling until a separate issue approves it.

## Future release sections

When release discipline matures, repos may adopt dated sections:

```md
## [0.1.0] - 2026-07-31

### Added
- Initial hosted MVP demo path.
```

Do not require version numbers, tags, GitHub Releases, generated notes, or semantic-release during MVP unless a separate release issue defines that process.

## Non-goals

This guidance does not implement:

- automated release tooling
- semantic-release
- generated release notes
- GitHub Releases requirements
- customer-facing release versioning policy
- enforcement bot
- CI check
- repo-specific changelog files
- billing or subscription release process

## Follow-up issues

Create small repo-specific follow-up issues if direct adoption is desired:

- add `CHANGELOG.md` to `control-plane-api`
- add `CHANGELOG.md` to `ai-execution-service`
- add `CHANGELOG.md` to `arbiter-console`
- add `CHANGELOG.md` to `arbiter-site`

Each follow-up should be one repo, one branch, and one PR.
