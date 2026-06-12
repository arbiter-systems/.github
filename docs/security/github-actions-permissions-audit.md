# GitHub Actions permissions audit

## Purpose

This document records the current least-privilege GitHub Actions permissions posture for active Arbiter repositories.

Issue: `.github#69`

## Scope

This audit is limited to workflow token permissions and public-safe CI/security hardening. It does not redesign CI, deployment, package publishing, project automation, or branch protection.

## Baseline standard

Workflows should declare explicit `permissions` instead of relying on repository defaults.

Default to:

```yaml
permissions:
  contents: read
```

Add only the minimum additional scopes needed by the workflow. Prefer read-only scopes for audit and validation jobs:

```yaml
permissions:
  contents: read
  issues: read
  pull-requests: read
```

Avoid broad write permissions. Do not use `permissions: write-all`. Any workflow requiring write behavior should document why it needs write access and should prefer a dedicated GitHub App token or other scoped credential over broad `GITHUB_TOKEN` permissions.

## Current organization findings

- No `pull_request_target` workflow usage was found during the audit.
- No `permissions: write-all` workflow usage was found during the audit.
- Organization-level `.github` validation and audit workflows use explicit least-privilege permissions.
- Retired project-field hydration workflows are retained only for compatibility/operator messaging and keep `GITHUB_TOKEN` read-only.
- Batch project-field hydration exposes an operator `write` input, but its workflow-level `GITHUB_TOKEN` permissions remain read-only. Any write path is expected to use explicitly configured automation credentials and repository variables.

## Active repository workflow review

| Repository | Workflow area | Audit result |
| --- | --- | --- |
| `arbiter-systems/.github` | Public docs validation | Explicit `contents: read`. |
| `arbiter-systems/.github` | Blocked By alignment audit | Explicit `contents: read` and `issues: read`. |
| `arbiter-systems/.github` | Retired project-field hydration wrappers | Explicit read-only permissions. |
| `arbiter-systems/.github` | Batch project-field hydration | Explicit read-only `GITHUB_TOKEN`; write behavior is gated outside default token permissions. |
| `arbiter-systems/control-plane-api` | CI and retired project-field hydration | Workflow permissions are present; keep scoped to validation/read-only behavior unless a future issue adds publishing/deployment. |
| `arbiter-systems/ai-execution-service` | CI and retired project-field hydration | Workflow permissions are present; keep scoped to validation/read-only behavior unless a future issue adds publishing/deployment. |
| `arbiter-systems/arbiter-console` | Workflow permissions | No explicit workflow permission hit was found in the connector audit; verify locally before adding new automation. |
| `arbiter-systems/arbiter-site` | Workflow permissions | No explicit workflow permission hit was found in the connector audit; verify locally before adding new automation. |
| `arbiter-systems/company` | Workflow permissions | No active workflow permission hit was found in the connector audit; keep private planning automation conservative. |

## Review checklist for future workflows

Before adding or changing a workflow:

- Declare workflow-level `permissions` explicitly.
- Start with `contents: read`.
- Add `issues`, `pull-requests`, `checks`, `statuses`, `packages`, `id-token`, or `deployments` only when required.
- Prefer `read` over `write` for validation, lint, test, docs, and audit jobs.
- Avoid `pull_request_target` unless a security review explicitly approves it.
- Do not expose secrets to pull request workflows from untrusted code.
- Keep write-enabled workflows manual, scoped, and documented.
- Document any required write permission in the workflow or a linked operations note.

## Completion note

This audit satisfies the repository-level documentation portion of `.github#69`. Future implementation PRs should make direct workflow edits only when a specific workflow lacks explicit permissions or uses broader scopes than required.
