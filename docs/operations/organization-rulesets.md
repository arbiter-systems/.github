# Organization Rulesets

## Purpose

This document defines the intended organization ruleset plan for active Arbiter repositories. Live ruleset creation, enforcement, bypass configuration, and repository targeting require GitHub owner/admin action. This document does not change runtime code, CI workflows, branch rulesets, labels, GitHub Project fields, or live GitHub settings.

## Verification Boundary

This document records intended governance posture only. It does not confirm live GitHub settings. Live rulesets must be verified by an owner/admin. Manual verification should be tracked through [GitHub security audit](github-security-audit.md).

## Ruleset Definitions

### main-protection

- Target ref pattern: `main`
- Applies to: all active repositories
- Intended rules:
  - Require pull request before merge
  - Require approvals before merge
  - Require conversation resolution before merge
  - Require status checks to pass before merge where checks exist
  - Require branches to be up to date before merge where required checks exist
  - Block force pushes
  - Block branch deletion
  - Restrict bypass to organization owners/admins only
- Bypass expectation: no routine bypass for agents or normal contributors
- Repo applicability note: repositories with no CI checks yet still require PR review and merge protections; required status checks are added only when checks exist and are named in `pr-quality-gates.md`.

### release-protection

- Target ref pattern: `release/*`
- Applies to: repositories that create release branches
- Intended rules:
  - Require pull request before merge
  - Require approvals before merge
  - Require conversation resolution before merge
  - Require status checks to pass before merge where checks exist
  - Require branches to be up to date before merge where required checks exist
  - Block force pushes
  - Block branch deletion
  - Restrict bypass to organization owners/admins only
- Bypass expectation: no routine bypass for agents or normal contributors
- Repo applicability note: not all repositories need release branches during MVP; use Not Applicable until release branches are introduced.

### tag-protection

- Target ref pattern: `v*`
- Applies to: repositories that create release tags
- Intended rules:
  - Restrict tag creation/update/deletion to owners/admins or an explicitly approved release actor
  - Block tag deletion
  - Block tag updates/force moves
- Bypass expectation: release tag bypass is limited to owners/admins or approved release automation after separate approval
- Repo applicability note: for pre-production checkpoint tags, follow [Milestone and release tag strategy](milestone-and-release-tag-strategy.md).

### branch-name-convention

- Target ref pattern or naming policy:
  - `<issue-number>-<type>/<short-description>`
  - `<issue-number>-<short-description>`
- Applies to: all active repositories
- Intended rules:
  - Require branch names to include the GitHub issue number
  - Prefer lowercase, hyphen-separated descriptions
  - Block generic long-lived branches except `main` and approved release branches
  - Enforcement through CI is deferred; the branch naming convention is documented as expected practice unless GitHub ruleset pattern support can express it cleanly.
- Bypass expectation: owners/admins may bypass only for emergency repair or migration work
- Repo applicability note: document as intended convention unless GitHub ruleset pattern support can express the full naming policy cleanly.

## Per-Repo Applicability Matrix

| Repo | Repo Type | main-protection | release-protection | tag-protection | branch-name-convention | Required status checks | Notes |
|---|---|---|---|---|---|---|---|
| `arbiter-systems/.github` | documentation/admin | Required | Not Applicable | Deferred | Required | `docs` | Docs/admin repo; apply tag-protection before creating the first release tag. |
| `arbiter-systems/control-plane-api` | application/code | Required | Not Applicable | Deferred | Required | `validate`, `lint`, `test`, `build` | Backend service; apply release-protection when the first release branch is introduced; apply tag-protection before creating the first release tag. |
| `arbiter-systems/ai-execution-service` | application/code | Required | Not Applicable | Deferred | Required | `validate`, `lint`, `typecheck`, `test`, `build` | Backend service; apply release-protection when the first release branch is introduced; apply tag-protection before creating the first release tag. |
| `arbiter-systems/arbiter-console` | application/code | Required | Not Applicable | Deferred | Required | `validate`, `lint`, `typecheck`, `test`, `build` | Frontend application; apply release-protection when the first release branch is introduced; apply tag-protection before creating the first release tag. |
| `arbiter-systems/arbiter-site` | application/code | Required | Not Applicable | Deferred | Required | `validate`, `lint`, `typecheck`, `build`, `docs` | Frontend/docs hybrid; apply release-protection when the first release branch is introduced; apply tag-protection before creating the first release tag. |
| `arbiter-systems/internal-roadmap` | documentation/admin | Required | Not Applicable | Deferred | Required | None documented yet | Private docs/admin repo; apply main-protection and branch-name convention, with no CI checks documented yet. |

## Owner/Admin Manual Steps

- Create or enable organization rulesets.
- Select repository targets for each ruleset.
- Confirm branch and tag target patterns.
- Configure required pull request settings.
- Configure required status checks from `pr-quality-gates.md`.
- Confirm bypass actors and bypass permissions.
- Confirm ruleset enforcement mode.
- Confirm any plan-gated ruleset features.
- Verify settings in each active repository.
- Record verification status in [GitHub security audit](github-security-audit.md).

## Intentionally Deferred

- Merge queue
- CODEOWNERS
- Automated ruleset enforcement or API application
- CI workflow changes
- Signed-tag enforcement until owner/admin verification confirms repository and plan support
- Deployment gates
- Ruleset JSON export/import automation
- Repository-specific remediation issues

## Related Documents

- [Branch protection and merge policy](branch-protection-and-merge-policy.md)
- [PR quality gates](pr-quality-gates.md)
- [GitHub security baseline matrix](github-security-baseline-matrix.md)
- [GitHub security audit](github-security-audit.md)
- [Milestone and release tag strategy](milestone-and-release-tag-strategy.md)
