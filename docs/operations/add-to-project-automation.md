# Add-to-Project Automation

## Purpose

Each active Arbiter repository deploys a `.github/workflows/add-to-project.yml` workflow that adds new and reopened issues and pull requests to the Arbiter organization GitHub Project. This replaces Project UI auto-add workflows, which are slot-limited and cannot scale across all active repositories.

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

The secret must be available in each covered repository. Prefer an organization-level secret so it is inherited automatically. Do not commit the token value to any file.

The workflow `permissions:` block controls the repository `GITHUB_TOKEN`; the `ADD_TO_PROJECT_PAT` permissions are controlled by the token stored in the secret.

## Project URL

The workflow targets `https://github.com/orgs/arbiter-systems/projects/<PROJECT_NUMBER>`. Update the placeholder with the actual project number before deployment.

## Project UI workflow posture

Project UI built-in workflows are reserved for lifecycle transitions only:

| Trigger | Action |
|---|---|
| Item added to project | Set Status = Triage |
| Issue closed | Set Status = Done |
| Issue reopened | Set Status = Triage |
| PR merged | Set Status = Done |
| Auto-archive | Archive Done items after retention window |

Do not add Project UI auto-add workflows for any repository. Use the GitHub Actions workflow instead.

## Validation

For each covered repository:

1. Confirm `ADD_TO_PROJECT_PAT` is available as a secret.
2. Confirm the project URL and number in the workflow file are correct.
3. Open a temporary validation issue or use a safe existing issue.
4. Confirm the issue appears in the Arbiter GitHub Project within workflow runtime.
5. Confirm no project fields (Status, Project Priority, Lane, etc.) were changed by the ingestion workflow.
6. Record the validation issue or PR reference in a comment on issue #76.

## Deployment to other repositories

Copy `workflow-templates/add-to-project.yml` from `arbiter-systems/.github` to `.github/workflows/add-to-project.yml` in each covered repository. No modifications are required beyond confirming the project URL placeholder is resolved.

## Out of scope

- Do not create GitHub Project UI workflows.
- Do not create or modify GitHub Project fields.
- Do not set Project field values in the workflow.
- Do not create or modify labels, milestones, or issue bodies.
- Do not add a labeled trigger.
- Do not add `pull_request_target`.
- Do not add checkout, shell steps, logging, debug output, API calls, conditionals, retries, or extra workflow steps.
- Do not deploy this workflow to the other repositories in this issue.
- Do not create or modify secrets.
- Do not include token values, credentials, private links, or internal data.

