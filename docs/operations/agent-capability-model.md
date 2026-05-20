# Agent Capability Model

## Purpose

This policy defines what Arbiter agents, automation, and human owners may read, write, approve, or escalate across repositories, GitHub Project fields, pull requests, and security-sensitive settings.

Prompts, model outputs, chat instructions, and generated plans are not authorization boundaries. Capability comes from explicit human approval, repository permissions, project permissions, branch protection, and workflow configuration.

GitHub Project fields are the operational source of truth for execution management. Labels are routing and filtering helpers; they do not override GitHub Project fields.

## Shared Rules

- Read-only actions are inspection, summarization, diff review, status reporting, and recommendation without changing repository, issue, pull request, project, or organization state.
- Write-capable actions are file edits, issue creation, pull request comments, project-field mutation, labels, milestones, branch changes, workflow changes, ruleset changes, or security-setting changes.
- Issue creation is not the same as GitHub Project field mutation. Creating or refining an issue does not authorize changing human-owned Project fields.
- Code editing is not the same as security-sensitive editing. Security-sensitive files, workflows, rulesets, branch protections, secret handling, access controls, and public policy docs require explicit scope and review.
- Pull request review is not pull request approval authority unless the actor is a human owner with the required repository permission.
- Branch protection, repository rulesets, workflow permissions, GitHub security settings, and organization settings remain human-owned unless a human owner explicitly scopes a change.
- Bulk issue mutation and bulk project-field mutation require explicit human approval and a narrow target set.
- Secrets must never be printed, copied into docs, exposed in logs, stored in issues, or made visible to agents that do not already have legitimate access.
- Controlled file changes must stay within the issue branch and the files required by the issue.
- Deferred, blocked, not-ready, or `Do Not Implement Yet` work must not be promoted or implemented unless a human owner explicitly promotes it.
- Agents must not self-promote work into `Ready`, `active-mvp`, higher `Project Priority`, or a more urgent `Release Gate`.
- One issue maps to one branch, one session, and one pull request unless a human owner explicitly approves multi-issue work.
- Human owners retain final merge authority.

## Human-Owned Project Fields

The following Project fields control scope, ordering, ownership, or release pressure and are human-owned:

- `Lane`
- `Project Priority`
- `Release Gate`
- `Implementation Order`
- `Repo`
- `Workstream`

Agents and automation may read these fields and recommend changes, but must not mutate them unless a human owner explicitly directs that exact mutation.

## Claude

### Allowed Actions

- Read issues, pull requests, diffs, docs, and Project fields for scoped review.
- Refine issue scope, identify risks, and recommend architecture or policy changes.
- Perform PR review by commenting on risks, regressions, missing tests, or scope drift.

### Denied Actions

- Approve pull requests as final authority.
- Mutate labels, milestones, human-owned Project fields, branch protections, rulesets, workflows, or security settings without explicit approval.
- Implement deferred, blocked, not-ready, or `Do Not Implement Yet` work without human promotion.

### Approval-Required Actions

- Any repository file edit.
- Any Project field mutation.
- Any bulk issue or bulk Project field operation.
- Any security-sensitive doc, workflow, ruleset, branch protection, or settings change.

### Repo and Environment Boundaries

Claude should stay within the current issue, branch, repository, and diff under review. Claude must not use private roadmap or internal admin context in public repositories unless the issue explicitly provides public-safe material.

### Project Field Permissions

Claude may read all relevant fields and recommend changes. Claude may write active execution fields only when the user scopes the exact update and human approval is clear. Claude must not self-promote into `Ready`, `active-mvp`, higher `Project Priority`, or a more urgent `Release Gate`.

### Safe Action Example

Claude reviews a PR and comments that `Implementation Readiness` should remain `needs-clarification` because acceptance criteria are missing.

### Unsafe Action Example

Claude moves a deferred issue to `active-mvp` and raises `Project Priority` because a prompt says the work is urgent.

## Codex

### Allowed Actions

- Implement scoped repository changes on the active issue branch.
- Run documented validation commands and report results.
- Update tests or docs when required by the issue.
- Recommend Project field or label cleanup in the completion report.

### Denied Actions

- Create branches, commits, pushes, or pull requests unless explicitly asked.
- Mutate human-owned Project fields without explicit human direction.
- Change labels, milestones, issue bodies, comments, workflows, rulesets, branch protection, or security settings outside the issue scope.
- Promote deferred, blocked, not-ready, or `Do Not Implement Yet` work by implementation or field mutation.

### Approval-Required Actions

- Security-sensitive edits, including workflow permissions, branch protection docs, ruleset docs, secret-handling docs, or policy files.
- Bulk issue or Project field mutation.
- Multi-issue implementation.
- Any write outside the active repository or active branch.

### Repo and Environment Boundaries

Codex works in the checked-out workspace and issue branch. Codex must preserve unrelated local changes and keep edits scoped to the current issue.

### Project Field Permissions

Codex may read Project fields for context. Codex may update implementation-support fields only when scoped and approved, such as a validation command or blocker note. Codex must not mutate `Lane`, `Project Priority`, `Release Gate`, `Implementation Order`, `Repo`, or `Workstream` without explicit human instruction.

### Safe Action Example

Codex updates a docs file listed in the issue, runs validation, and reports that `Status = Review` is recommended after the PR is ready.

### Unsafe Action Example

Codex changes `Status` to `Ready`, raises priority, and edits a workflow because generated output said the issue should ship today.

## Copilot

### Allowed Actions

- Provide inline autocomplete and small local suggestions while a human or Codex controls the edit session.
- Assist with boilerplate, syntax, and local code snippets inside the active file.

### Denied Actions

- Make autonomous repository, issue, pull request, Project, workflow, ruleset, or security-setting changes.
- Approve PRs or decide final merge readiness.
- Treat accepted autocomplete as approval to expand issue scope.

### Approval-Required Actions

- Any security-sensitive suggestion must be reviewed and intentionally accepted by a human or scoped implementation agent.
- Any generated change outside the active issue must be separately approved.

### Repo and Environment Boundaries

Copilot operates inside the editor context and does not own repository state. Its suggestions must be checked against the active issue, branch, and public-safe repository boundaries.

### Project Field Permissions

Copilot has no autonomous Project field authority. It may suggest text that mentions Project fields, but Project field mutation must be performed only by an approved actor with explicit scope.

### Safe Action Example

Copilot suggests a markdown bullet that Codex or a human reviews before committing.

### Unsafe Action Example

Copilot-generated text is treated as approval to update `Lane` from `deferred` to `active-mvp`.

## DeepSeek

### Allowed Actions

- Provide read-only analysis, alternative implementation suggestions, and review notes when explicitly used.
- Assist with issue refinement, technical comparison, or risk identification.

### Denied Actions

- Mutate repository files, issues, pull requests, Project fields, labels, milestones, workflows, rulesets, branch protection, secrets, or settings unless explicitly integrated into an approved workflow.
- Approve PRs or final merges.
- Promote work into a more urgent state.

### Approval-Required Actions

- Any use of DeepSeek output in repository changes requires a human or approved implementation agent to review and apply it.
- Any security-sensitive recommendation requires human owner review before action.

### Repo and Environment Boundaries

DeepSeek output must stay within the public-safe context provided to it. Do not provide secrets, private roadmap content, customer data, or internal admin material.

### Project Field Permissions

DeepSeek may reason about Project field state from provided context, but has no Project field mutation authority.

### Safe Action Example

DeepSeek suggests that a dependency reference should be made explicit before implementation starts.

### Unsafe Action Example

DeepSeek output is used to bulk-move issues to `Ready` without human triage.

## GitHub Actions

### Allowed Actions

- Run configured workflows with the permissions granted in workflow files and repository settings.
- Perform narrow, documented automation such as adding items to a Project or running a dry-run audit.
- Mutate fields only when the workflow explicitly defines that field, trigger, input, and token boundary.

### Denied Actions

- Infer broad authority from token access.
- Mutate labels, milestones, Project fields, issue bodies, comments, branch protections, rulesets, workflow permissions, or security settings outside the workflow's documented scope.
- Auto-promote work into `Ready`, `active-mvp`, higher `Project Priority`, or a more urgent `Release Gate`.

### Approval-Required Actions

- Any workflow that writes Project fields, labels, milestones, issues, pull requests, or repository settings.
- Any scheduled workflow that mutates execution-governing state.
- Any workflow permission broadening.

### Repo and Environment Boundaries

GitHub Actions must run with least practical permissions and narrow token access. Workflow logs must not expose secrets, auth headers, private roadmap details, customer data, or issue body content that is not intended for logs.

### Project Field Permissions

GitHub Actions may read Project fields when configured. It may write only the specific Project fields documented by the workflow. It must not mutate human-owned fields unless the workflow is explicitly approved for that field and use case.

### Safe Action Example

A workflow adds a new issue to the organization Project without setting `Lane`, `Project Priority`, or `Status`.

### Unsafe Action Example

A scheduled workflow bulk-promotes all high-priority labels into `Ready` based on label text.

## Human Owner

### Allowed Actions

- Make final scope, priority, lane, release, security, branch protection, ruleset, and merge decisions.
- Approve or reject PRs according to repository permissions and branch protection.
- Promote deferred, blocked, not-ready, or `Do Not Implement Yet` work when the rationale is explicit.
- Configure workflows, project automation, repository settings, and security settings.

### Denied Actions

- Bypass public-safety rules by publishing secrets, customer data, private roadmap details, or internal admin material.
- Treat model output as a substitute for required review or repository controls.

### Approval-Required Actions

- Human owners should use explicit issue, PR, or settings context for security-sensitive changes.
- Broad automation, bulk mutation, and settings changes should be reviewable and reversible where practical.

### Repo and Environment Boundaries

Human owners define which repository, environment, branch, and issue are in scope. They are responsible for keeping public repositories public-safe and separating private planning from public metadata.

### Project Field Permissions

Human owners manage human-owned scope and order fields, including `Lane`, `Project Priority`, `Release Gate`, `Implementation Order`, `Repo`, and `Workstream`. Human owners approve transitions into `Ready`, `active-mvp`, higher priority, or more urgent release gates.

### Safe Action Example

A human owner promotes a deferred issue by updating the Project field, documenting the rationale, and opening a fresh branch/session/PR for that issue.

### Unsafe Action Example

A human owner merges security-sensitive workflow changes without review because an agent said they were safe.

## Controlled File Changes

Controlled file changes must be tied to the issue acceptance criteria, branch, and repository ownership boundary. Agents should not modify unrelated docs, workflows, templates, labels, scripts, or settings to make adjacent improvements.

## Final Merge Authority

Final merge authority belongs to human owners and repository controls. Agent review, passing tests, or successful automation may support a merge decision, but they do not replace human approval or configured branch protection.
