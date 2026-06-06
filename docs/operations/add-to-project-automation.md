# Add-to-Project Automation

## Purpose

Each active Arbiter repository may keep a local `.github/workflows/add-to-project.yml` workflow only when a human owner explicitly approves repository-level project ingestion.

The previous shared `workflow-templates/add-to-project.yml` template was removed because event-triggered issue and pull request automation can consume GitHub Actions minutes across repositories and is no longer the recommended default for Arbiter Systems.

Prefer explicit, bounded project-field hydration workflows and manual project triage over automatic issue/PR ingestion.

## Covered repositories

- `arbiter-systems/.github`
- `arbiter-systems/control-plane-api`
- `arbiter-systems/ai-execution-service`
- `arbiter-systems/arbiter-console`
- `arbiter-systems/arbiter-site`
- `arbiter-systems/company`

## Required secret

| Secret name | Scope | Required access |
|---|---|---|
| `ADD_TO_PROJECT_PAT` | Organization or per-repo | Scoped to add issues and pull requests to the Arbiter organization Project and read covered repositories. |

The secret must be available only to repositories that intentionally retain a local add-to-project workflow. Prefer the narrowest practical scope. Do not commit the token value to any file.

The workflow `permissions:` block controls the repository `GITHUB_TOKEN`; the `ADD_TO_PROJECT_PAT` permissions are controlled by the token stored in the secret.

## Project URL

Any retained local workflow must target the current Arbiter organization project and must not leave placeholder values such as `<PROJECT_NUMBER>` in committed workflow files.

## Project UI workflow posture

Project UI built-in workflows are reserved for lifecycle transitions only:

| Trigger | Action |
|---|---|
| Item added to project | Set Status = Triage |
| Issue closed | Set Status = Done |
| Issue reopened | Set Status = Triage |
| PR merged | Set Status = Done |
| Auto-archive | Archive Done items after retention window |

Do not add Project UI auto-add workflows for any repository without explicit human approval.

## Validation

For each repository that intentionally retains add-to-project automation:

1. Confirm `ADD_TO_PROJECT_PAT` is available only where needed.
2. Confirm the project URL and number in the workflow file are correct.
3. Confirm the workflow is intentionally enabled and its triggers are approved.
4. Open a temporary validation issue or use a safe existing issue.
5. Confirm the issue appears in the Arbiter GitHub Project within workflow runtime.
6. Confirm no project fields such as Status, Project Priority, Lane, Phase, or Implementation Readiness were changed by the ingestion workflow.
7. Record the validation issue or PR reference in the tracking issue.

## Deployment to other repositories

There is no shared add-to-project workflow template to copy from `.github`.

If a repository needs project-ingestion automation, create a repo-specific issue and explicitly document:

- why automatic ingestion is needed instead of manual triage or bounded batch hydration
- which triggers are allowed
- which secret or GitHub App credential is required
- which Project URL is targeted
- how Actions-minute usage will be contained
- how the workflow avoids mutating Project fields, labels, milestones, or issue bodies

## Out of scope

- Do not create GitHub Project UI auto-add workflows.
- Do not create or modify GitHub Project fields.
- Do not set Project field values in the workflow.
- Do not create or modify labels, milestones, or issue bodies.
- Do not add a labeled trigger.
- Do not add `pull_request_target`.
- Do not add checkout, shell steps, logging, debug output, API calls, conditionals, retries, or extra workflow steps unless separately scoped and approved.
- Do not deploy this workflow to other repositories in this issue.
- Do not create or modify secrets.
- Do not include token values, credentials, private links, or internal data.
