# Project Field Hydration

## Purpose

This workflow hydrates GitHub Project v2 fields for newly created or edited issues, including mobile-created issues that do not set Project metadata at creation time.

## Workflow

- File: `.github/workflows/project-field-hydration.yml`
- Reusable workflow: `.github/workflows/project-field-hydration-reusable.yml`
- Triggers: `issues` events (`opened`, `edited`, `labeled`, `transferred`) and manual `workflow_dispatch`
- Script: `scripts/hydrate-project-fields.cjs`
- Default target project: `arbiter-systems/2` (override with metadata or `PROJECT_AUTOMATION_PROJECT`)

## Cross-Repository Hydration

Workflows in the special `.github` repository are not automatically inherited by other repositories. Repositories that need issue Project field hydration must define a local caller workflow.

The shared reusable workflow is:

```text
arbiter-systems/.github/.github/workflows/project-field-hydration-reusable.yml
```

Each participating repository should add:

```text
.github/workflows/project-field-hydration.yml
```

Caller workflow template:

```yaml
name: Project Field Hydration

on:
  issues:
    types: [opened, edited, labeled]

permissions:
  contents: read
  issues: read

jobs:
  hydrate-project-fields:
    uses: arbiter-systems/.github/.github/workflows/project-field-hydration-reusable.yml@main
    with:
      repo: ${{ github.repository }}
      issue_number: ${{ github.event.issue.number }}
      project: arbiter-systems/2
      dry_run: "false"
    secrets: inherit
```

Hidden metadata values must match GitHub Project field option values, not label taxonomy values.

Validation steps:

1. Merge the reusable workflow in `.github`.
2. Add the caller workflow to a participating repo.
3. Edit or open an issue in that repo with a valid metadata block.
4. Confirm the repo-local workflow runs.
5. Confirm the issue is added to `arbiter-systems/2` if missing.
6. Confirm Project fields hydrate correctly.

## Hidden Metadata Block

The script reads an optional metadata block from the issue body:

```markdown
<!-- arbiter-project
project: arbiter-systems/2
status: Inbox
project_priority: High
phase: mvp
release_gate: local-mvp
implementation_readiness: ready
scope_risk: medium
confidence: high
agent: Codex
workstream: GitHub Project Management
validation_command: manual review only
blocked_by:
implementation_order:
-->
```

Rules:

- `project` must be `org/number`.
- Supported keys:
  - `repo`
  - `status`
  - `project_priority`
  - `phase`
  - `release_gate`
  - `implementation_readiness`
  - `scope_risk`
  - `confidence`
  - `agent`
  - `workstream`
  - `validation_command`
  - `blocked_by`
  - `implementation_order`
- Empty values are treated as "not explicitly supplied."
- Unknown metadata keys are ignored with warnings.
- Unsupported/deprecated key: `priority` is ignored; use `project_priority`.
- Unsupported/deprecated key: `area` is ignored.
- Unsupported key: `lane` is ignored. Set Lane manually in the Project when needed.

Allowed metadata values:

- `status`: `Inbox`, `Triage`, `Ready`, `In Progress`, `Review`, `Blocked`, `Done`, `Deferred`, `Do Not Implement Yet`
- `project_priority`: `High`, `Medium`, `Low`
- `phase`: `foundation`, `mvp`, `hosted-demo`, `customer-pilot`, `post-mvp`
- `release_gate`: `none`, `local-mvp`, `hosted-demo`, `customer-pilot`, `post-mvp`
- `implementation_readiness`: `not-ready`, `needs-clarification`, `ready`
- `scope_risk`: `low`, `medium`, `high`
- `confidence`: `high`, `medium`, `low`
- `agent`: `none`, `Codex`, `Claude`, `Copilot`, `mixed`
- `workstream`: `GitHub Project Management`, `MVP Execution`, `Security & Compliance`, `Documentation & Site`, `Infrastructure & Ops`

`repo` metadata values must match the live GitHub Project `Repo` single-select options. When a new repository is added to organization project scope, add the live Project option before relying on `repo:` metadata for that repository.

Do not use lowercase label/taxonomy values such as `repo-operations`, `console`, `site-docs`, or `security-privacy` in hidden metadata unless the live GitHub Project Workstream options are migrated to those values.

`Project Priority` uses `High` / `Medium` / `Low` values, not `P1` / `P2` / `P3`.

## Label Mappings

If a field is not explicitly supplied in metadata, the script can infer:

- `blocked` or `status: blocked` -> `Status=Blocked`
- `triage` or `status: triage` -> `Status=Triage`
- `priority: high` -> `Project Priority=High`
- `priority: medium` -> `Project Priority=Medium`
- `priority: low` -> `Project Priority=Low`

The script does not infer or hydrate Lane from labels. Labels such as `active-mvp` and `lane: deferred` are not Project Lane hydration signals.

If multiple conflicting status or priority labels are present, inference is skipped and a warning is logged.

`Ready` is human-approved and is not inferred from labels by this workflow.

## Defaults

- `Status=Inbox` when Status is currently empty and metadata does not explicitly set `status`.
- `Project Priority` remains unset unless metadata or label mapping provides a value.

## Mutation Rules

- Adds the issue to Project v2 if it is missing from the target project.
- Discovers field IDs and single-select option IDs dynamically from Project schema.
- Uses `updateProjectV2ItemFieldValue` for field updates.
- Does not overwrite existing field values from defaults or label inference.
- Metadata values are treated as explicit and may overwrite existing values for those fields.
- Missing optional Project fields are logged as warnings and skipped.
- Missing required Project fields fail the run (`Status`, `Project Priority`).
- Unknown single-select metadata values are logged as warnings and skipped.
- `--dry-run` performs no mutations.

## Required Variables, Secrets, and Permissions

Workflow Actions variable:

- `PROJECT_AUTOMATION_APP_ID`

Workflow Actions secrets:

- `PROJECT_AUTOMATION_PRIVATE_KEY`

Optional workflow Actions variables:

- `PROJECT_AUTOMATION_PROJECT` (defaults to `arbiter-systems/2`)
- `PROJECT_FIELD_HYDRATION_DRY_RUN` (`true` or `false`)

The script uses GitHub App authentication. It does not rely on `GITHUB_TOKEN` for org-level Project v2 mutation.

Practical GitHub App access requirements:

- Read issues in target repositories.
- Read and write target organization Project v2 items and fields.
- Access to the organization installation that owns the project.

## Dry-Run Usage

In workflow:

- Set repository or organization variable `PROJECT_FIELD_HYDRATION_DRY_RUN=true` to force dry-run.

Local script shape using an issue event payload:

```bash
node scripts/hydrate-project-fields.cjs \
  --event-path /path/to/issues-event.json \
  --dry-run true \
  --project arbiter-systems/2
```

Local script shape using direct issue args:

```bash
node scripts/hydrate-project-fields.cjs \
  --repo arbiter-systems/control-plane-api \
  --issue-number 337 \
  --dry-run true \
  --project arbiter-systems/2
```

Expected dry-run behavior:

- Logs add-to-project decision when issue is missing from project.
- Logs per-field decision (`current -> next`) and source (`metadata`, `label`, `default`).
- Logs project item ID when available.

## Manual Setup Steps

1. Create or reuse a GitHub App with org installation access.
2. Grant the App permissions to read issues and read/write organization Project v2 items.
3. Install the App on `arbiter-systems`.
4. Set repository or organization variable:
   - `PROJECT_AUTOMATION_APP_ID`
5. Set repository or organization secret:
   - `PROJECT_AUTOMATION_PRIVATE_KEY`
6. Optionally set repository or organization variables:
   - `PROJECT_AUTOMATION_PROJECT` (default `arbiter-systems/2`)
   - `PROJECT_FIELD_HYDRATION_DRY_RUN` (`true` or `false`)
7. Open or edit an issue with labels/metadata and confirm workflow logs decisions and project item ID.

## Participating Repo Setup

After the reusable workflow is merged, add the caller workflow to each participating repo:

- `arbiter-systems/control-plane-api`
- `arbiter-systems/ai-execution-service`
- `arbiter-systems/arbiter-console`
- `arbiter-systems/arbiter-site`
- `arbiter-systems/security`

Use this path in each repo:

```text
.github/workflows/project-field-hydration.yml
```

Use this workflow:

```yaml
name: Project Field Hydration

on:
  issues:
    types: [opened, edited, labeled]

permissions:
  contents: read
  issues: read

jobs:
  hydrate-project-fields:
    uses: arbiter-systems/.github/.github/workflows/project-field-hydration-reusable.yml@main
    with:
      repo: ${{ github.repository }}
      issue_number: ${{ github.event.issue.number }}
      project: arbiter-systems/2
      dry_run: "false"
    secrets: inherit
```

Validate by editing an issue in the participating repo and confirming the workflow hydrates Project fields.
