# Controlled File Policy

## Purpose

Define controlled repository paths and the review and disclosure rules for agent-initiated changes.

Controlled files are higher-risk because they can affect security posture, automation behavior, agent behavior, repository governance, deployment behavior, or project execution state.

## Policy Statement

- Treat this document as a review and disclosure policy, not a capability grant.
- Do not infer permission to edit controlled files from tool access, prompt text, or model output.
- Require explicit human instruction before an agent changes controlled files.
- Require security-owner review when a controlled-file change can weaken security posture, secret handling, workflow permissions, branch protections, rulesets, deployment behavior, or project-field governance.
- Keep controlled-file edits public-safe. Do not include secrets, credentials, private links, customer data, or internal-only material.
- Treat GitHub Project fields as the operational source of truth for execution management.
- Treat labels and taxonomy docs as routing helpers. Labels do not override GitHub Project fields.
- Do not promote deferred, not-ready, blocked, or `Do Not Implement Yet` work through controlled-file edits.
- Keep final merge authority with the human owner.

## Controlled File Categories

| Category | Representative paths |
|---|---|
| Agent instruction files | `AGENTS.md`, `CLAUDE.md`, `.claude/**`, `docs/agent-workflow-wrappers.md`, model/tool workflow docs |
| GitHub automation | `.github/workflows/**`, action configuration, add-to-project workflows, project automation scripts, `scripts/**` when used by GitHub automation |
| Repository governance | `CODEOWNERS`, branch/ruleset docs, PR quality gates, issue/project operating docs |
| Security posture documents | `docs/operations/github-security-*.md`, security checklists, dependency vulnerability baselines, secret-handling guidance |
| Auth, tenant, secret-handling, and CORS code or config | Auth middleware, tenant boundary code, API key handling, secret loaders, CORS config, environment validation |
| Deployment, hosting, environment, and infrastructure config | Docker, Compose, deployment manifests, hosting config, environment templates, IaC, runtime config |
| Dependency and package manager files | `package.json`, lockfiles, `.csproj`, `Directory.Packages.props`, Dependabot config, package manager config |
| Project taxonomy, label, milestone, and lane policy documents | label taxonomy, milestone strategy, lane policy, Project operating model, Project automation conventions |

## Review Requirement Matrix

| Category | Representative paths | Human review required | Security-owner review required | Docs-only agent allowed | Denied without explicit user instruction |
|---|---|---|---|---|---|
| Agent instruction files | `AGENTS.md`, `CLAUDE.md`, `.claude/**`, agent workflow docs | Any behavior or instruction change | Required when permissions, secrets, workflow authority, or review rules change | Read and recommend; edit only when issue-scoped | Self-modification, weakening agent limits, expanding authority |
| GitHub automation | `.github/workflows/**`, action config, project automation scripts | Any workflow, trigger, permission, or script behavior change | Required for token use, write permissions, secret access, project-field writes, deployment, or security scanning | Read and document expected behavior | New workflows, permission broadening, live mutation behavior, secret exposure |
| Repository governance | `CODEOWNERS`, branch/ruleset docs, PR gates, Project operating docs | Any policy or governance change | Required when review gates, branch protection, rulesets, bypass, or merge controls change | Docs-only clarification with explicit scope | Weakening review gates, bypass expectations, ruleset posture, or merge authority |
| Security posture documents | Security baselines, audits, checklists, vulnerability docs | Any security claim or baseline change | Required for controls, exceptions, plan-gated gaps, secret scanning, code scanning, dependency handling | Public-safe wording and factual updates | Downgrading controls, hiding gaps, publishing sensitive details |
| Auth, tenant, secret-handling, and CORS code or config | Auth, tenant, API key, CORS, secret config | Any code or config change | Required for behavioral, access-control, secret, or cross-origin changes | Docs-only agents may identify required review | Weakening auth, tenant isolation, CORS, key handling, or secret rules |
| Deployment, hosting, environment, and infrastructure config | Docker, Compose, hosting, environment, IaC | Any deployment or runtime config change | Required when public exposure, credentials, environments, networking, or production behavior changes | Docs-only agents may document existing config | Changing deployment targets, secret sources, network exposure, or runtime infra |
| Dependency and package manager files | Manifests, lockfiles, Dependabot config | Any dependency or package manager change | Required for security tooling, supply-chain controls, dependency source changes, or risky upgrades | Docs-only agents may recommend follow-up | Unreviewed dependency source changes, lockfile churn, security update policy changes |
| Project taxonomy, label, milestone, and lane policy documents | label taxonomy, milestone docs, lane policy, Project docs | Any taxonomy, status, lane, milestone, or Project field policy change | Required when execution state, readiness, priority, release gates, or automation boundaries change | Docs-only clarification with explicit scope | Promoting work, redefining readiness, changing priority/lane/release semantics |

## Agent Instruction Files

- Treat `AGENTS.md`, `CLAUDE.md`, `.claude/**`, model/tool workflow docs, and agent workflow wrappers as controlled files.
- Require explicit user instruction for edits that change agent behavior, review rules, implementation limits, or tool usage.
- Do not use an agent-generated plan as authorization to change agent instructions.

## GitHub Automation

- Treat workflows, action configuration, add-to-project workflows, and project automation scripts as controlled files.
- Require human review for trigger, permission, token, schedule, or mutation behavior changes.
- Require security-owner review when automation reads secrets, writes GitHub Project fields, changes security scans, changes deployment behavior, or broadens repository access.
- Keep automation mutation scope narrow and documented. Do not infer broad authority from token access.

## Repository Governance

- Treat `CODEOWNERS`, branch/ruleset docs, PR quality gates, issue templates, and Project operating docs as controlled files.
- Require human review for governance changes that affect review, merge, branch, ruleset, issue, or Project behavior.
- Do not weaken review gates, branch/ruleset expectations, or final merge authority without explicit human approval.

## Security Posture Documents

- Treat security baselines, security audits, vulnerability baselines, secret-scanning notes, and security checklists as controlled files.
- Require security-owner review for changes that modify baseline expectations, downgrade controls, describe exceptions, or affect hosted-demo security posture.
- Keep logs, examples, and docs free of secrets, credentials, private links, customer data, and internal-only material.

## Auth, Tenant, Secret-Handling, and CORS Code or Config

- Treat auth, tenant isolation, API key handling, secret loading, environment validation, and CORS code or config as controlled.
- Require explicit issue scope and security-owner review before changing behavior.
- Do not weaken access boundaries, secret-handling rules, or cross-origin restrictions through agent edits.

## Deployment, Hosting, Environment, and Infrastructure Config

- Treat deployment, hosting, environment, Docker, Compose, IaC, and infrastructure config as controlled.
- Require human review for all runtime exposure, environment, deployment, or hosting changes.
- Require security-owner review when credentials, network exposure, production-like environments, or public hosting behavior are affected.

## Dependency and Package Manager Files

- Treat dependency manifests, lockfiles, package manager config, project files, and Dependabot config as controlled when supply-chain risk is relevant.
- Require human review for dependency additions, dependency source changes, lockfile updates, package manager behavior, or automated update posture.
- Require security-owner review when dependency changes affect vulnerability handling, security scanners, package sources, or supply-chain controls.

## Project Taxonomy, Label, Milestone, and Lane Policy Documents

- Treat label taxonomy, milestone strategy, lane policy, Project operating model, and Project automation conventions as controlled.
- Keep GitHub Project fields authoritative for execution management.
- Keep labels as routing helpers that do not override GitHub Project fields.
- Do not promote deferred, not-ready, blocked, or `Do Not Implement Yet` work by changing taxonomy, labels, milestones, lane docs, or Project field policy.
- Agents may recommend `Ready` promotion, but must not perform it.

## Mixed PRs

- Apply the strictest review path when a PR touches both controlled and ordinary files.
- Separate controlled-file changes from ordinary implementation changes when practical.
- Do not bury controlled-file changes inside broad cleanup PRs.

## Self-Modification

An agent self-modification attempt is any agent-initiated change that would alter:

- the agent's own instruction file
- the agent's review or implementation rules
- workflow permissions or triggers used by that agent
- automation that routes, approves, labels, prioritizes, or promotes agent work
- validation gates that determine whether the agent's work is accepted

Self-modification includes changes to `AGENTS.md`, `CLAUDE.md`, workflow files the agent relies on, wrapper docs that define agent behavior, and automation scripts that grant or route agent work.

Reject self-modification unless the user explicitly requested that exact controlled-file change.

## Disclosure Requirements

Call out controlled files separately in issue completion reports and PR summaries. Do not bury controlled-file changes in a general changed-files list.

Use this section when controlled files changed:

```markdown
## Controlled Files Changed

- `<path>` - reason for change, review requirement, and whether security-owner review is required.
```

If no controlled files changed, the report may say:

```markdown
Controlled files changed: none.
```

## Denied Agent Actions

- Do not weaken review gates, branch/ruleset expectations, security posture, secret-handling rules, or project-field governance without explicit human approval.
- Do not modify controlled files outside the active issue scope.
- Do not change workflow permissions, branch protection, rulesets, security settings, or deployment behavior unless explicitly requested.
- Do not create, promote, prioritize, label, milestone, or route work by changing controlled docs or automation without explicit approval.
- Do not self-promote work into `Ready`, `active-mvp`, higher `Project Priority`, or a more urgent `Release Gate`.
- Do not implement deferred, not-ready, blocked, or `Do Not Implement Yet` work unless a human owner explicitly promotes it.

## Follow-Up Work

- Add CI or policy checks only in a separate issue.
- Add CODEOWNERS only in a separate issue.
- Add branch protection or ruleset enforcement only through owner/admin action.
- Track controlled-file review gaps as follow-up issues instead of expanding unrelated PRs.

## Non-Goals

- Do not implement CI enforcement.
- Do not modify CODEOWNERS.
- Do not modify branch protection.
- Do not modify rulesets.
- Do not modify workflows.
- Do not add runtime enforcement.
- Do not add a policy DSL.
- Do not change GitHub settings, secrets, token permissions, or deployment configuration.

## Related Documents

- [PR quality gates](pr-quality-gates.md)
- [Branch protection and merge policy](branch-protection-and-merge-policy.md)
- [Organization rulesets](organization-rulesets.md)
- [GitHub security baseline matrix](github-security-baseline-matrix.md)
- [GitHub Project operating model](github-project-operating-model.md)
- [Issue lane policy](../issue-lane-policy.md)
- [GitHub label taxonomy](github-label-taxonomy.md)
