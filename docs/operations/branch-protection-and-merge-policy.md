# Branch Protection and Merge Policy

## Overview

Arbiter Systems repositories should use branch protection and merge rules to keep changes reviewable, CI-backed, and reversible as work expands across backend services, public web properties, console work, and organization operations. This checklist documents the intended safety posture only; it does not apply repository settings, create rulesets, or enforce required checks.

See also: [pr-quality-gates.md](pr-quality-gates.md) for per-repo PR readiness commands and recommended CI check names.

## Default Branch Protection Checklist

Use this as the recommended default for active repositories once their CI workflows are stable enough to rely on.

- [ ] Protect `main` from direct pushes.
- [ ] Require pull requests before merging into `main`.
- [ ] Require passing CI checks before merging into `main`.
- [ ] Require conversation resolution before merge.
- [ ] Restrict force pushes on protected branches.
- [ ] Restrict branch deletion on protected branches.
- [ ] Enable automatic deletion of merged branches where available.
- [ ] Keep admin bypass rare and intentional.
- [ ] Document any repository-specific exceptions in the repository README, AGENTS.md, or operations docs.

## `main` Branch Policy

`main` should represent the stable integration branch for each repository. It should be safe to inspect, demo, and use as the base for new work.

Recommended policy:

- Use pull requests for all changes unless an emergency fix requires a documented exception.
- Require CI checks that are meaningful for the repository.
- Prefer small, focused pull requests tied to a single issue.
- Avoid merging unrelated cleanup with feature work.
- Avoid direct commits to `main` for normal development.
- Keep release, deployment, and promotion rules outside this checklist until those workflows exist.

## `dev` Branch Policy

Some repositories may use a `dev` branch while the backend MVP is stabilizing. `dev` can be less strict than `main`, but it should still prevent accidental loss of work.

Recommended policy where `dev` exists:

- Protect `dev` from force pushes.
- Require pull requests for shared work once more than one person or tool is contributing.
- Require fast local validation before merge when full CI is not yet stable.
- Allow lighter review expectations than `main` during early iteration.
- Periodically reconcile `dev` back toward `main` to avoid long-lived divergence.

Repositories that do not use `dev` do not need to add it only for this policy.

## Required Checks

Required checks should match the maturity and purpose of each repository. Do not block merges on checks that are noisy, missing, or not yet trusted.

Recommended baseline:

| Repository type | Required check guidance |
|---|---|
| Backend services | Build, unit tests, integration or contract tests where available, config validation where available. |
| Public site / docs site | Install, typecheck, lint, build, and link or markdown checks where available. |
| Arbiter Console | Install, typecheck, lint, test, build, and route/component checks where available. |
| `.github` repo | Markdown review and manual rendered-preview inspection until automated checks exist. |

Before making a check required:

- [ ] The check runs consistently on pull requests.
- [ ] The check fails for real defects.
- [ ] The check is not frequently flaky.
- [ ] The check name is stable.
- [ ] The repository has a clear remediation path when the check fails.

## Pull Request Review Expectations

Default expectations:

- Use one issue per branch and pull request when practical.
- Keep pull requests scoped and easy to review.
- Include the validation commands or manual checks performed.
- Include known limitations and intentionally deferred work.
- Request review before merge for backend, security, governance, policy, provider routing, infrastructure, and console changes.
- Allow lightweight self-review for small docs-only changes when no product, runtime, security, or operational claims are affected.

Review should focus on correctness, scope control, maintainability, validation evidence, and whether the change stays within the issue goals.

## Merge Method Preference

Recommended default:

- Prefer squash merge for issue-scoped work so the history stays compact and each merged unit has a clear purpose.
- Use rebase merge only for clean, linear commits that are already reviewable as-is.
- Use merge commits only when preserving branch structure is useful, such as larger coordinated work or external contribution context.

Pull request titles should use conventional prefixes where practical, such as `docs(ops):`, `feat(execution):`, `test(contracts):`, or `chore(repo):`.

## Repository-Specific Guidance

| Repository | Recommended posture |
|---|---|
| `arbiter-systems/control-plane-api` | Highest protection. Require build and test validation before `main`. Require review for execution, policy, routing, resilience, security, and configuration changes. |
| `arbiter-systems/ai-execution-service` | Highest protection. Require test and contract validation before `main`. Require review for execution streaming, provider boundaries, readiness, and security-sensitive changes. |
| `arbiter-systems/arbiter-site` | Moderate protection. Require build/typecheck once available. Allow lightweight review for content-only changes that do not introduce unsupported product claims. |
| `arbiter-systems/arbiter-console` | High protection once created. Require typecheck, lint, test, and build before `main`. Require review for operational screens, API integration, auth, and governance surfaces. |
| `arbiter-systems/.github` | Moderate protection. Keep changes documentation-only or metadata-only unless explicitly scoped. Review public-facing profile, templates, and organization guidance for accuracy and public safety. |

## Docs-Only Changes

Docs-only changes may use a lighter path when they are low risk.

Allowed lighter path:

- Single-purpose markdown update.
- No runtime code, CI workflow, repository setting, secret, or policy enforcement change.
- No new product capability claim unless already true.
- Manual rendered-preview inspection is enough when no markdown automation exists.

Require normal review when docs touch:

- Security posture.
- Compliance or governance claims.
- Public product claims.
- Operational runbooks for production behavior.
- Architecture decisions that affect backend implementation.
- Roadmap or scope commitments.

## Emergency Fixes

Emergency fixes should remain rare. When they are needed:

- Keep the change as small as possible.
- Document why the normal pull request path was bypassed or shortened.
- Run the fastest relevant validation before merge.
- Open a follow-up issue for any cleanup, test coverage, or documentation missed during the emergency.
- Backfill review after the emergency if the change touched runtime, security, policy, infrastructure, or public claims.

## Admin Bypass Expectations

Admin bypass should be treated as an exception, not a normal workflow.

Acceptable cases:

- Restoring a broken repository state.
- Fixing a blocked or misconfigured protection rule.
- Applying an urgent correction that cannot wait for the normal path.

When bypass is used, record the reason in the pull request, issue, or follow-up comment.

## Future Automation

Future automation can apply this policy more consistently after repository workflows are stable.

Potential future work:

- GitHub ruleset automation.
- Required status check enforcement.
- CODEOWNERS.
- Merge queue.
- Repository settings audit script.
- Organization-level branch protection drift report.

Do not add these until the underlying repository workflows and required check names are stable.

## Intentionally Deferred

Deferred / out of scope for this checklist:

- Actual branch protection changes.
- GitHub ruleset automation.
- CODEOWNERS.
- Required status check enforcement.
- Merge queue.
- Deployment gates.
- Release automation.
- CI workflow changes.
- Runtime code changes.
