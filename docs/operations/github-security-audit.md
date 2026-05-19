# GitHub Security Audit Worksheet

Audited as of: 2026-05-19

## Purpose / Overview

This worksheet inventories GitHub organization and repository security settings for Arbiter Systems across the active repositories. It is documentation-only: it records locally verifiable evidence, owner/admin-only checks, and follow-up questions without changing GitHub settings, workflows, CODEOWNERS, branch protection, rulesets, labels, milestones, or runtime code.

## Verification Boundary

This worksheet uses only local files and local git metadata from this checkout. It does not assume authenticated GitHub organization or repository settings access.

Audit status values:

| Status | Meaning |
|---|---|
| ✅ confirmed | Local files or local git metadata directly confirm the item. |
| ❌ gap found | Local files or local git metadata directly show a gap. |
| ⚠️ cannot verify without owner access | The item requires GitHub owner/admin access or live GitHub settings access. |
| — not applicable | The item clearly does not apply to that repository. |

Documented policy expectations are not confirmed live settings. When a setting is described in local documentation, this worksheet records it as a documented expectation in notes rather than marking it confirmed as a live GitHub setting.

## Repositories In Scope

| Repository | Local evidence available in this checkout | Notes |
|---|---|---|
| `.github` | ✅ confirmed | This checkout contains organization metadata and operations docs for the public `.github` repository. |
| `control-plane-api` | ⚠️ cannot verify without owner access | This checkout contains policy references for the repo, but not that repo's settings or source tree. |
| `ai-execution-service` | ⚠️ cannot verify without owner access | This checkout contains policy references for the repo, but not that repo's settings or source tree. |
| `arbiter-console` | ⚠️ cannot verify without owner access | This checkout contains policy references for the repo, but not that repo's settings or source tree. |
| `arbiter-site` | ⚠️ cannot verify without owner access | This checkout contains policy references for the repo, but not that repo's settings or source tree. |
| `internal-roadmap` | ⚠️ cannot verify without owner access | This public `.github` checkout must not expose private roadmap or internal planning content from `internal-roadmap`. |

## Local Evidence Reviewed

| Evidence | Status | Notes |
|---|---|---|
| [AGENTS.md](../../AGENTS.md) | ✅ confirmed | Defines this repository as public-safe organization metadata and states that product code, runtime infrastructure, customer data, secrets, private links, and internal roadmap material are out of scope. |
| [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md) | ✅ confirmed | Documents intended branch protection, PR review, required-check readiness, admin bypass, and deferred automation guidance. It does not confirm live GitHub settings. |
| docs/operations/pr-quality-gates.md | ❌ gap found | docs/operations/pr-quality-gates.md was expected by the audit scope but was not present in this checkout at audit time. First verify this branch is up to date; if the file is still missing, create or restore it in a separate documentation issue. |
| [issue-lane-policy.md](../issue-lane-policy.md) | ✅ confirmed | Documents active MVP versus deferred/post-MVP issue lanes and AI agent scope rules. |
| [git-conventions.md](../git-conventions.md) | ✅ confirmed | Documents one-issue-per-branch/session/PR, PR title conventions, issue-linking rules, and AI session restrictions. |
| Local git branch | ✅ confirmed | Current branch is `58-chorerepo-audit-github-organization-and-repository-security-settings`. |
| Local git branch list | ✅ confirmed | Local and remote branch metadata are available in this checkout, but do not prove live branch protection or repository settings. |
| Local git log | ✅ confirmed | Recent local history shows merged documentation PRs and the current issue branch, but does not prove live GitHub settings. |

## Organization-Level Settings Checklist

| Control | Audit result | Local evidence | Owner/admin verification needed |
|---|---|---|---|
| Organization member 2FA requirement | ⚠️ cannot verify without owner access | No local file or git metadata exposes organization authentication settings. | Confirm org-level 2FA requirement in GitHub organization security settings. |
| Default repository visibility policy | ⚠️ cannot verify without owner access | Local docs state this repository is public-safe; they do not prove org defaults. | Confirm default visibility and repository creation permissions. |
| Repository creation restrictions | ⚠️ cannot verify without owner access | No local evidence. | Confirm who can create public/private/internal repositories. |
| Outside collaborator review | ⚠️ cannot verify without owner access | No local evidence. | Review outside collaborators and access levels. |
| Fine-grained token and classic PAT policy | ⚠️ cannot verify without owner access | No local evidence. | Confirm token restrictions, approval requirements, and expiration posture. |
| GitHub Apps and OAuth app access | ⚠️ cannot verify without owner access | No local evidence. | Review installed apps and OAuth app restrictions. |
| Secret scanning and push protection defaults | ⚠️ cannot verify without owner access | Local docs prohibit secrets, but do not confirm live settings. | Confirm secret scanning and push protection are enabled where available. |
| Dependabot security updates and alerts | ⚠️ cannot verify without owner access | No local evidence. | Confirm org and repo-level Dependabot settings. |
| Audit log review process | ⚠️ cannot verify without owner access | No local evidence. | Confirm owner access to audit logs and review cadence. |

## Per-Repository 15-Item Audit

### `.github`

| # | Checklist item | Result | Evidence / notes | Owner manual check |
|---:|---|---|---|---|
| 1 | Repository visibility is intentional and matches purpose | ⚠️ cannot verify without owner access | [AGENTS.md](../../AGENTS.md) documents public-safe organization metadata scope, but local files do not prove live visibility. | Confirm visibility is intentional for the org metadata repository. |
| 2 | Default repository visibility for the organization is private where org settings allow | ⚠️ cannot verify without owner access | No local evidence exposes organization defaults. | Confirm organization default repository visibility. |
| 3 | Repository creation permissions are restricted to owners | ⚠️ cannot verify without owner access | No local evidence exposes organization creation permissions. | Confirm repository creation permissions. |
| 4 | Branch protection or ruleset exists for main / primary branch | ⚠️ cannot verify without owner access | [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md) documents intended policy only. | Confirm live `main` branch protection or ruleset. |
| 5 | Branch names follow issue-number convention per docs/git-conventions.md | ✅ confirmed | Visible local branch metadata follows issue-number naming for issue branches in this checkout; this does not prove org-wide or future compliance. | Confirm live branch list does not include unmanaged long-lived work branches. |
| 6 | Required PR checks are defined or documented as pending in docs/operations/pr-quality-gates.md | ❌ gap found | `docs/operations/pr-quality-gates.md` was expected but missing in this checkout at audit time. | Verify branch freshness, then create or restore the document if still missing. |
| 7 | Force-push protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm force-push restriction on protected branches. |
| 8 | Branch deletion protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm branch deletion restriction on protected branches. |
| 9 | Automatic branch deletion after merge is enabled | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm automatic deletion of merged branches where appropriate. |
| 10 | Admin bypass is restricted or documented | ⚠️ cannot verify without owner access | Branch protection policy documents expectations, not live bypass settings. | Confirm bypass actors and admin bypass posture. |
| 11 | Dependabot alerts / security alerts are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm Dependabot/security alert posture. |
| 12 | Secret scanning and push protection are enabled | ⚠️ cannot verify without owner access | Local docs prohibit secrets but do not prove live scanning settings. | Confirm secret scanning and push protection. |
| 13 | Wikis / Discussions / Projects are disabled unless actively used | ⚠️ cannot verify without owner access | No local settings available. | Confirm feature toggles and active usage. |
| 14 | Repository description and topics are safe and public-appropriate | ⚠️ cannot verify without owner access | Local docs define public-safe posture, but repo settings are not visible locally. | Confirm live description and topics. |
| 15 | Public repos do not expose private roadmap, secrets, or customer data | ✅ confirmed | [AGENTS.md](../../AGENTS.md) confirms the local public-safe policy for this repo, including restrictions on secrets, customer data, private links, and private roadmap material. This is policy evidence, not exhaustive secret scanning of all content or live GitHub settings. | Continue manual review of future public docs and run owner/admin checks where available. |

### `control-plane-api`

| # | Checklist item | Result | Evidence / notes | Owner manual check |
|---:|---|---|---|---|
| 1 | Repository visibility is intentional and matches purpose | ⚠️ cannot verify without owner access | This checkout references the repo but does not expose live visibility settings. | Confirm visibility and access model. |
| 2 | Default repository visibility for the organization is private where org settings allow | ⚠️ cannot verify without owner access | No local evidence exposes organization defaults. | Confirm organization default repository visibility. |
| 3 | Repository creation permissions are restricted to owners | ⚠️ cannot verify without owner access | No local evidence exposes organization creation permissions. | Confirm repository creation permissions. |
| 4 | Branch protection or ruleset exists for main / primary branch | ⚠️ cannot verify without owner access | Branch protection policy recommends highest protection, but live settings are not visible. | Confirm live `main` branch protection or ruleset. |
| 5 | Branch names follow issue-number convention per docs/git-conventions.md | ⚠️ cannot verify without owner access | [git-conventions.md](../git-conventions.md) documents the convention, but this checkout does not expose the repo's branch list. | Confirm live branch list follows convention. |
| 6 | Required PR checks are defined or documented as pending in docs/operations/pr-quality-gates.md | ❌ gap found | `docs/operations/pr-quality-gates.md` was expected but missing in this checkout at audit time. | Verify branch freshness, then create or restore the document if still missing. |
| 7 | Force-push protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm force-push restriction on protected branches. |
| 8 | Branch deletion protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm branch deletion restriction on protected branches. |
| 9 | Automatic branch deletion after merge is enabled | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm automatic deletion of merged branches where appropriate. |
| 10 | Admin bypass is restricted or documented | ⚠️ cannot verify without owner access | Branch protection policy documents expectations, not live bypass settings. | Confirm bypass actors and admin bypass posture. |
| 11 | Dependabot alerts / security alerts are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm Dependabot/security alert posture. |
| 12 | Secret scanning and push protection are enabled | ⚠️ cannot verify without owner access | Local docs prohibit secrets but do not prove live scanning settings. | Confirm secret scanning and push protection. |
| 13 | Wikis / Discussions / Projects are disabled unless actively used | ⚠️ cannot verify without owner access | No local settings available. | Confirm feature toggles and active usage. |
| 14 | Repository description and topics are safe and public-appropriate | ⚠️ cannot verify without owner access | Local docs do not expose live repo metadata. | Confirm live description and topics. |
| 15 | Public repos do not expose private roadmap, secrets, or customer data | ⚠️ cannot verify without owner access | This checkout does not inspect `control-plane-api` contents or settings. | Confirm repo-local docs, source, and settings do not expose private or sensitive material. |

### `ai-execution-service`

| # | Checklist item | Result | Evidence / notes | Owner manual check |
|---:|---|---|---|---|
| 1 | Repository visibility is intentional and matches purpose | ⚠️ cannot verify without owner access | This checkout references the repo but does not expose live visibility settings. | Confirm visibility and access model. |
| 2 | Default repository visibility for the organization is private where org settings allow | ⚠️ cannot verify without owner access | No local evidence exposes organization defaults. | Confirm organization default repository visibility. |
| 3 | Repository creation permissions are restricted to owners | ⚠️ cannot verify without owner access | No local evidence exposes organization creation permissions. | Confirm repository creation permissions. |
| 4 | Branch protection or ruleset exists for main / primary branch | ⚠️ cannot verify without owner access | Branch protection policy recommends highest protection, but live settings are not visible. | Confirm live `main` branch protection or ruleset. |
| 5 | Branch names follow issue-number convention per docs/git-conventions.md | ⚠️ cannot verify without owner access | [git-conventions.md](../git-conventions.md) documents the convention, but this checkout does not expose the repo's branch list. | Confirm live branch list follows convention. |
| 6 | Required PR checks are defined or documented as pending in docs/operations/pr-quality-gates.md | ❌ gap found | `docs/operations/pr-quality-gates.md` was expected but missing in this checkout at audit time. | Verify branch freshness, then create or restore the document if still missing. |
| 7 | Force-push protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm force-push restriction on protected branches. |
| 8 | Branch deletion protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm branch deletion restriction on protected branches. |
| 9 | Automatic branch deletion after merge is enabled | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm automatic deletion of merged branches where appropriate. |
| 10 | Admin bypass is restricted or documented | ⚠️ cannot verify without owner access | Branch protection policy documents expectations, not live bypass settings. | Confirm bypass actors and admin bypass posture. |
| 11 | Dependabot alerts / security alerts are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm Dependabot/security alert posture. |
| 12 | Secret scanning and push protection are enabled | ⚠️ cannot verify without owner access | Local docs prohibit secrets but do not prove live scanning settings. | Confirm secret scanning and push protection. |
| 13 | Wikis / Discussions / Projects are disabled unless actively used | ⚠️ cannot verify without owner access | No local settings available. | Confirm feature toggles and active usage. |
| 14 | Repository description and topics are safe and public-appropriate | ⚠️ cannot verify without owner access | Local docs do not expose live repo metadata. | Confirm live description and topics. |
| 15 | Public repos do not expose private roadmap, secrets, or customer data | ⚠️ cannot verify without owner access | This checkout does not inspect `ai-execution-service` contents or settings. | Confirm repo-local docs, source, and settings do not expose private or sensitive material. |

### `arbiter-console`

| # | Checklist item | Result | Evidence / notes | Owner manual check |
|---:|---|---|---|---|
| 1 | Repository visibility is intentional and matches purpose | ⚠️ cannot verify without owner access | This checkout references the repo but does not expose live visibility settings. | Confirm visibility and access model. |
| 2 | Default repository visibility for the organization is private where org settings allow | ⚠️ cannot verify without owner access | No local evidence exposes organization defaults. | Confirm organization default repository visibility. |
| 3 | Repository creation permissions are restricted to owners | ⚠️ cannot verify without owner access | No local evidence exposes organization creation permissions. | Confirm repository creation permissions. |
| 4 | Branch protection or ruleset exists for main / primary branch | ⚠️ cannot verify without owner access | Branch protection policy recommends high protection once created, but live settings are not visible. | Confirm live `main` branch protection or ruleset. |
| 5 | Branch names follow issue-number convention per docs/git-conventions.md | ⚠️ cannot verify without owner access | [git-conventions.md](../git-conventions.md) documents the convention, but this checkout does not expose the repo's branch list. | Confirm live branch list follows convention. |
| 6 | Required PR checks are defined or documented as pending in docs/operations/pr-quality-gates.md | ❌ gap found | `docs/operations/pr-quality-gates.md` was expected but missing in this checkout at audit time. | Verify branch freshness, then create or restore the document if still missing. |
| 7 | Force-push protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm force-push restriction on protected branches. |
| 8 | Branch deletion protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm branch deletion restriction on protected branches. |
| 9 | Automatic branch deletion after merge is enabled | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm automatic deletion of merged branches where appropriate. |
| 10 | Admin bypass is restricted or documented | ⚠️ cannot verify without owner access | Branch protection policy documents expectations, not live bypass settings. | Confirm bypass actors and admin bypass posture. |
| 11 | Dependabot alerts / security alerts are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm Dependabot/security alert posture. |
| 12 | Secret scanning and push protection are enabled | ⚠️ cannot verify without owner access | Local docs prohibit secrets but do not prove live scanning settings. | Confirm secret scanning and push protection. |
| 13 | Wikis / Discussions / Projects are disabled unless actively used | ⚠️ cannot verify without owner access | No local settings available. | Confirm feature toggles and active usage. |
| 14 | Repository description and topics are safe and public-appropriate | ⚠️ cannot verify without owner access | Local docs do not expose live repo metadata. | Confirm live description and topics. |
| 15 | Public repos do not expose private roadmap, secrets, or customer data | ⚠️ cannot verify without owner access | This checkout does not inspect `arbiter-console` contents or settings. | Confirm repo-local docs, source, and settings do not expose private or sensitive material. |

### `arbiter-site`

| # | Checklist item | Result | Evidence / notes | Owner manual check |
|---:|---|---|---|---|
| 1 | Repository visibility is intentional and matches purpose | ⚠️ cannot verify without owner access | This checkout references the repo but does not expose live visibility settings. | Confirm visibility and access model. |
| 2 | Default repository visibility for the organization is private where org settings allow | ⚠️ cannot verify without owner access | No local evidence exposes organization defaults. | Confirm organization default repository visibility. |
| 3 | Repository creation permissions are restricted to owners | ⚠️ cannot verify without owner access | No local evidence exposes organization creation permissions. | Confirm repository creation permissions. |
| 4 | Branch protection or ruleset exists for main / primary branch | ⚠️ cannot verify without owner access | Branch protection policy recommends moderate protection, but live settings are not visible. | Confirm live `main` branch protection or ruleset. |
| 5 | Branch names follow issue-number convention per docs/git-conventions.md | ⚠️ cannot verify without owner access | [git-conventions.md](../git-conventions.md) documents the convention, but this checkout does not expose the repo's branch list. | Confirm live branch list follows convention. |
| 6 | Required PR checks are defined or documented as pending in docs/operations/pr-quality-gates.md | ❌ gap found | `docs/operations/pr-quality-gates.md` was expected but missing in this checkout at audit time. | Verify branch freshness, then create or restore the document if still missing. |
| 7 | Force-push protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm force-push restriction on protected branches. |
| 8 | Branch deletion protection is enabled on protected branches | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm branch deletion restriction on protected branches. |
| 9 | Automatic branch deletion after merge is enabled | ⚠️ cannot verify without owner access | Intended in branch protection policy only. | Confirm automatic deletion of merged branches where appropriate. |
| 10 | Admin bypass is restricted or documented | ⚠️ cannot verify without owner access | Branch protection policy documents expectations, not live bypass settings. | Confirm bypass actors and admin bypass posture. |
| 11 | Dependabot alerts / security alerts are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm Dependabot/security alert posture. |
| 12 | Secret scanning and push protection are enabled | ⚠️ cannot verify without owner access | Local docs prohibit secrets but do not prove live scanning settings. | Confirm secret scanning and push protection. |
| 13 | Wikis / Discussions / Projects are disabled unless actively used | ⚠️ cannot verify without owner access | No local settings available. | Confirm feature toggles and active usage. |
| 14 | Repository description and topics are safe and public-appropriate | ⚠️ cannot verify without owner access | Local docs do not expose live repo metadata. | Confirm live description and topics. |
| 15 | Public repos do not expose private roadmap, secrets, or customer data | ⚠️ cannot verify without owner access | This checkout does not inspect `arbiter-site` contents or settings. | Confirm repo-local docs, source, and settings do not expose private or sensitive material. |

### `internal-roadmap`

| # | Checklist item | Result | Evidence / notes | Owner manual check |
|---:|---|---|---|---|
| 1 | Repository visibility is intentional and matches purpose | ⚠️ cannot verify without owner access | This public `.github` checkout must not expose private roadmap content, but does not prove `internal-roadmap` visibility. | Confirm `internal-roadmap` visibility and access model. |
| 2 | Default repository visibility for the organization is private where org settings allow | ⚠️ cannot verify without owner access | No local evidence exposes organization defaults. | Confirm organization default repository visibility. |
| 3 | Repository creation permissions are restricted to owners | ⚠️ cannot verify without owner access | No local evidence exposes organization creation permissions. | Confirm repository creation permissions. |
| 4 | Branch protection or ruleset exists for main / primary branch | ⚠️ cannot verify without owner access | No local live settings available. | Confirm live `main` branch protection or ruleset. |
| 5 | Branch names follow issue-number convention per docs/git-conventions.md | ⚠️ cannot verify without owner access | [git-conventions.md](../git-conventions.md) documents the convention, but this checkout does not expose the repo's branch list. | Confirm live branch list follows convention. |
| 6 | Required PR checks are defined or documented as pending in docs/operations/pr-quality-gates.md | ❌ gap found | `docs/operations/pr-quality-gates.md` was expected but missing in this checkout at audit time. | Verify branch freshness, then create or restore the document if still missing. |
| 7 | Force-push protection is enabled on protected branches | ⚠️ cannot verify without owner access | No local live settings available. | Confirm force-push restriction on protected branches. |
| 8 | Branch deletion protection is enabled on protected branches | ⚠️ cannot verify without owner access | No local live settings available. | Confirm branch deletion restriction on protected branches. |
| 9 | Automatic branch deletion after merge is enabled | ⚠️ cannot verify without owner access | No local live settings available. | Confirm automatic deletion of merged branches where appropriate. |
| 10 | Admin bypass is restricted or documented | ⚠️ cannot verify without owner access | No local live settings available. | Confirm bypass actors and admin bypass posture. |
| 11 | Dependabot alerts / security alerts are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm Dependabot/security alert posture. |
| 12 | Secret scanning and push protection are enabled | ⚠️ cannot verify without owner access | No local settings available. | Confirm secret scanning and push protection. |
| 13 | Wikis / Discussions / Projects are disabled unless actively used | ⚠️ cannot verify without owner access | No local settings available. | Confirm feature toggles and active usage. |
| 14 | Repository description and topics are safe and public-appropriate | ⚠️ cannot verify without owner access | Local docs do not expose live repo metadata. | Confirm live description and topics. |
| 15 | Public repos do not expose private roadmap, secrets, or customer data | ⚠️ cannot verify without owner access | This public `.github` checkout does not expose private roadmap content, but this audit does not inspect `internal-roadmap` contents or live visibility. | Confirm private roadmap content remains contained in the correct access-controlled repo. |

## Additional owner/admin checks

These controls require owner/admin access and are not substitutes for the 15-item per-repo checklist above:

- Organization member 2FA requirement and member access policy.
- Outside collaborators and pending invitations.
- Fine-grained token and classic PAT policies.
- GitHub Apps and OAuth app access.
- Organization audit log review process.
- CODEOWNERS presence and code owner review requirements.
- Deployment environments, environment secrets, and required deployment reviewers.

## Blockers before hosted demo or customer pilot

These items should be resolved or explicitly accepted by an owner before a hosted demo or customer pilot depends on GitHub-hosted source, CI, deployment, or repository access controls.

| Blocker | Status | Why it matters before hosted demo/customer pilot | Required owner action |
|---|---|---|---|
| Missing `docs/operations/pr-quality-gates.md` | ❌ gap found | PR readiness expectations are part of the audit scope, but the file was not present in this checkout at audit time. | First verify this branch is up to date; if still missing, create or restore the quality gates document in a separate documentation issue. |
| Organization member 2FA requirement | ⚠️ cannot verify without owner access | A hosted demo or pilot increases the cost of compromised organization access. | Confirm org-level 2FA requirement and member access posture. |
| Repository visibility and access for all six active repos | ⚠️ cannot verify without owner access | Incorrect visibility or overbroad access can expose private planning, service code, secrets, or pilot-sensitive work. | Confirm visibility and role assignments for `.github`, `control-plane-api`, `ai-execution-service`, `arbiter-console`, `arbiter-site`, and `internal-roadmap`. |
| Branch protection or rulesets for default branches | ⚠️ cannot verify without owner access | Hosted demo and pilot work should not rely on unprotected default branches. | Confirm PR requirement, force-push restriction, branch deletion restriction, and any rulesets for default branches. |
| Required status checks and check names | ⚠️ cannot verify without owner access | Required checks need to be stable before they can protect hosted-demo or pilot-bound changes. | Confirm check names and required-check configuration after repo-local workflows are stable. |
| Pull request review requirements and bypass permissions | ⚠️ cannot verify without owner access | Security-sensitive changes should not bypass review accidentally. | Confirm review requirements, admin bypass rules, and allowed bypass actors. |
| Secret scanning and push protection | ⚠️ cannot verify without owner access | Hosted demo or pilot work must not expose provider credentials, private tokens, customer data, or internal material. | Confirm secret scanning and push protection for all active repos where available. |
| Dependabot/security alerts | ⚠️ cannot verify without owner access | Dependency vulnerabilities should be visible before demo or pilot traffic depends on the repos. | Confirm Dependabot alerts and security update posture per repo. |
| GitHub Apps, OAuth apps, and token policies | ⚠️ cannot verify without owner access | Third-party access and long-lived tokens can create unmanaged access paths. | Review installed apps, OAuth restrictions, token policies, and approval requirements. |
| Environment secrets and deployment protections | ⚠️ cannot verify without owner access | Deployable repos may need protected environments and reviewer gates before hosting. | Confirm deployment environments, required reviewers, and secret scopes for deployable repos. |

## Recommended owner/admin verification queue

Owners should verify these items in GitHub organization and repository settings:

- Organization 2FA requirement and member access policy.
- Repository visibility for all six active repositories.
- Admin, maintainer, write, triage, and read access assignments.
- Outside collaborators and pending invitations.
- Branch protection or rulesets for default branches.
- Required status checks and check names.
- Pull request review requirements and bypass permissions.
- Force-push and branch deletion restrictions.
- Automatic branch deletion after merge.
- Wikis, Discussions, and Projects feature usage.
- Repository descriptions and topics.
- Secret scanning, push protection, and Dependabot/security alert posture.
- GitHub Apps, OAuth app access, and token policies.
- Environment secrets, deployment environments, and required deployment reviewers where applicable.

## Local Git Metadata Snapshot

### `git branch --show-current`

```text
58-chorerepo-audit-github-organization-and-repository-security-settings
```

### `git branch --all`

```text
  23-docsmvp-define-ai-execution-firewall-claim-guardrails
  24-docsapi-document-mvp-execution-gateway-integration-contract
  25-docsdemo-add-sample-customer-ai-waste-scenarios
  26-docsroadmap-define-sellable-mvp-completion-gate
  27-docslabels-update-taxonomy-for-mvp-and-demo-labels
  37-choreci-add-required-quality-gates-for-pr-readiness
  39-chorerepo-add-pr-checklist-template-for-ai-assisted-implementation
  41-chorerepo-add-issue-implementation-prompt-template
  42-chorerepo-add-claude-review-checklist
  48-chorerepo-add-branch-naming-and-commit-message-conventions
  51-docsrepo-add-claude-prompt-generation-and-agent-compliance-templates
  55-docsrepo-define-active-and-deferred-issue-lane-policy
  57-docsproject-add-cross-repo-mvp-dependency-map
* 58-chorerepo-audit-github-organization-and-repository-security-settings
  main
  remotes/origin/23-docsmvp-define-ai-execution-firewall-claim-guardrails
  remotes/origin/24-docsapi-document-mvp-execution-gateway-integration-contract
  remotes/origin/25-docsdemo-add-sample-customer-ai-waste-scenarios
  remotes/origin/26-docsroadmap-define-sellable-mvp-completion-gate
  remotes/origin/27-docslabels-update-taxonomy-for-mvp-and-demo-labels
  remotes/origin/28-docsbrand-reserve-company-social-handles-and-define-minimal-social-presence
  remotes/origin/37-choreci-add-required-quality-gates-for-pr-readiness
  remotes/origin/39-chorerepo-add-pr-checklist-template-for-ai-assisted-implementation
  remotes/origin/41-chorerepo-add-issue-implementation-prompt-template
  remotes/origin/42-chorerepo-add-claude-review-checklist
  remotes/origin/48-chorerepo-add-branch-naming-and-commit-message-conventions
  remotes/origin/51-docsrepo-add-claude-prompt-generation-and-agent-compliance-templates
  remotes/origin/55-docsrepo-define-active-and-deferred-issue-lane-policy
  remotes/origin/57-docsproject-add-cross-repo-mvp-dependency-map
  remotes/origin/58-chorerepo-audit-github-organization-and-repository-security-settings
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

### `git log --oneline --decorate -n 50`

```text
924e249 (HEAD -> 58-chorerepo-audit-github-organization-and-repository-security-settings, origin/58-chorerepo-audit-github-organization-and-repository-security-settings) Merge pull request #62 from arbiter-systems/57-docsproject-add-cross-repo-mvp-dependency-map
71fe7ec (origin/57-docsproject-add-cross-repo-mvp-dependency-map, 57-docsproject-add-cross-repo-mvp-dependency-map) docs: polish MVP dependency issue index
719347a Merge pull request #60 from arbiter-systems/55-docsrepo-define-active-and-deferred-issue-lane-policy
3bf2320 (origin/55-docsrepo-define-active-and-deferred-issue-lane-policy, 55-docsrepo-define-active-and-deferred-issue-lane-policy) docs: complete issue lane non-goals
8d1c238 Merge pull request #54 from arbiter-systems/48-chorerepo-add-branch-naming-and-commit-message-conventions
df627aa (origin/48-chorerepo-add-branch-naming-and-commit-message-conventions, 48-chorerepo-add-branch-naming-and-commit-message-conventions) docs(repo): add Git conventions
2c726d4 Merge pull request #53 from arbiter-systems/42-chorerepo-add-claude-review-checklist
418fd4d (origin/42-chorerepo-add-claude-review-checklist, 42-chorerepo-add-claude-review-checklist) docs: add Claude review checklist
8c93d52 (main) Merge pull request #52 from arbiter-systems/51-docsrepo-add-claude-prompt-generation-and-agent-compliance-templates
6220346 (origin/51-docsrepo-add-claude-prompt-generation-and-agent-compliance-templates, 51-docsrepo-add-claude-prompt-generation-and-agent-compliance-templates) Add agent workflow templates
15a0676 Merge pull request #50 from arbiter-systems/39-chorerepo-add-pr-checklist-template-for-ai-assisted-implementation
065ccd7 (origin/39-chorerepo-add-pr-checklist-template-for-ai-assisted-implementation, 39-chorerepo-add-pr-checklist-template-for-ai-assisted-implementation) Add pull request checklist template
1568824 Merge pull request #49 from arbiter-systems/41-chorerepo-add-issue-implementation-prompt-template
380012f (origin/41-chorerepo-add-issue-implementation-prompt-template, 41-chorerepo-add-issue-implementation-prompt-template) Add Codex issue prompt template
38819cf (origin/28-docsbrand-reserve-company-social-handles-and-define-minimal-social-presence) Merge pull request #34 from arbiter-systems/26-docsroadmap-define-sellable-mvp-completion-gate
3a827ce (origin/26-docsroadmap-define-sellable-mvp-completion-gate, 26-docsroadmap-define-sellable-mvp-completion-gate) docs: link sellable MVP gate to existing issues
1b25ccb Merge pull request #33 from arbiter-systems/26-docsroadmap-define-sellable-mvp-completion-gate
bbbc713 docs: refine sellable MVP completion gate
718d618 Revise README to clarify project purpose and features
fe33160 Merge pull request #32 from arbiter-systems/25-docsdemo-add-sample-customer-ai-waste-scenarios
10a06d7 (origin/25-docsdemo-add-sample-customer-ai-waste-scenarios, 25-docsdemo-add-sample-customer-ai-waste-scenarios) docs(operations): tighten sample AI waste scenario claims
5407703 Merge pull request #31 from arbiter-systems/24-docsapi-document-mvp-execution-gateway-integration-contract
7cc438e (origin/24-docsapi-document-mvp-execution-gateway-integration-contract, 24-docsapi-document-mvp-execution-gateway-integration-contract) docs(operations): tighten MVP integration contract claims
9934859 Merge pull request #30 from arbiter-systems/23-docsmvp-define-ai-execution-firewall-claim-guardrails
78d8773 (origin/23-docsmvp-define-ai-execution-firewall-claim-guardrails, 23-docsmvp-define-ai-execution-firewall-claim-guardrails) docs(operations): add MVP claim guardrails
4744615 Merge pull request #29 from arbiter-systems/27-docslabels-update-taxonomy-for-mvp-and-demo-labels
fc48003 (origin/27-docslabels-update-taxonomy-for-mvp-and-demo-labels, 27-docslabels-update-taxonomy-for-mvp-and-demo-labels) docs(labels): expand taxonomy for MVP-era AI Execution Firewall work
bf4c81e Update contact email in README
80d724c Merge pull request #22 from arbiter-systems/docs/mvp-backend-baseline
38dbd09 docs(ops): record backend MVP baseline and next-phase gate
0001977 test(e2e): record local two-service Docker validation
3dc5155 Merge pull request #19 from arbiter-systems/11-docsops-document-local-two-service-docker-compatibility-flow
74fdfa8 docs(ops): document local two-service Docker flow
f3aabea Merge pull request #18 from arbiter-systems/16-docs-agents-usage-review-discipline
e0110ab docs(agents): add usage and review discipline section
78c3c9e Merge pull request #17 from arbiter-systems/docs/github-label-palette-defaults
3836c7a docs(ops): fix label taxonomy section order
7219e56 docs(ops): document GitHub label palette and defaults
b597eb6 Merge pull request #15 from arbiter-systems/13-docs-branch-protection-merge-policy
b0a3ac1 docs(ops): define branch protection and merge policy
be738bb docs(ops): document GitHub label taxonomy
d16b14a Merge pull request #8 from arbiter-systems/docs/web-console-timing-checklist
d777a45 docs(planning): add web and console timing checklist
2aa1968 Merge pull request #7 from arbiter-systems/1-docsorg-finalize-github-organization-profile-and-public-positioning
f4e0986 docs(profile): finalize organization README
d376e1e Merge pull request #6 from arbiter-systems/5-choreops-document-mvp-budget-alerts-and-cost-controls
c798216 docs(ops): add MVP cost-control checklist
03e6297 docs(agents): add organization metadata agent instructions
0483869 Delete README.md
9f44a08 Revise README for Arbiter Systems project overview
```

Live GitHub settings remain ⚠️ cannot verify without owner access.

## Cross-References

- [branch-protection-and-merge-policy.md](branch-protection-and-merge-policy.md)
- docs/operations/pr-quality-gates.md was expected but missing in this checkout at audit time.
- [git-conventions.md](../git-conventions.md)
- [issue-lane-policy.md](../issue-lane-policy.md)

## Follow-Up Items

| Suggested title | Target repo | One-line description | Suggested labels |
|---|---|---|---|
| docs(operations): restore PR quality gates documentation | `.github` | Verify the branch is up to date, then create or restore `docs/operations/pr-quality-gates.md` if it remains expected for future security audits. | `type/docs`, `area/docs`, `component/ops` |
| Complete owner/admin GitHub settings verification | `.github` | Have an owner verify organization and repository settings that cannot be confirmed from local files. | `type/chore`, `area/security`, `component/ops` |
| Reconcile live branch protection with documented policy | Repo-specific | Open repo-specific remediation issues where live branch protection differs from the documented policy. | `type/chore`, `area/security`, `component/platform` |
| Add or stabilize required CI checks | Repo-specific | Add workflow or settings work in separate repo issues where required checks are missing or unstable; do not add workflow YAML from this audit. | `type/chore`, `area/ci`, `component/infrastructure` |
| Investigate any sensitive content exposure | Repo-specific or private admin process | If sensitive data, secrets, or private planning content are found during owner review, handle cleanup through the appropriate private incident or admin process. | `type/chore`, `area/security` |
