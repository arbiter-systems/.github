# Project Field Hydration

## Purpose

This workflow hydrates GitHub Project v2 fields for newly created or edited issues, including mobile-created issues that do not set Project metadata at creation time.

## Workflow

- File: `.github/workflows/project-field-hydration.yml`
- Triggers: `issues` events (`opened`, `edited`, `labeled`)
- Script: `scripts/hydrate-project-fields.js`
- Default target project: `arbiter-systems/2` (override with metadata or `PROJECT_AUTOMATION_PROJECT`)

## Hidden Metadata Block

The script reads an optional metadata block from the issue body:

```markdown
<!-- arbiter-project
project: arbiter-systems/2
status: Inbox
lane: active-mvp
project_priority: High
phase: mvp
release_gate: local-mvp
implementation_readiness: ready
scope_risk: medium
confidence: high
agent: Codex
workstream: MVP Execution
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
  - `lane`
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

Allowed metadata values:

- `status`: `Inbox`, `Triage`, `Ready`, `In Progress`, `Review`, `Blocked`, `Done`, `Deferred`, `Do Not Implement Yet`
- `lane`: `active-mvp`, `deferred`
- `project_priority`: `High`, `Medium`, `Low`
- `phase`: `foundation`, `mvp`, `hosted-demo`, `customer-pilot`, `post-mvp`
- `release_gate`: `none`, `local-mvp`, `hosted-demo`, `customer-pilot`, `post-mvp`
- `implementation_readiness`: `not-ready`, `needs-clarification`, `ready`
- `scope_risk`: `low`, `medium`, `high`
- `confidence`: `high`, `medium`, `low`
- `agent`: `none`, `Codex`, `Claude`, `Copilot`, `mixed`
- `workstream`: `GitHub Project Management`, `MVP Execution`, `Security & Compliance`, `Documentation & Site`, `Infrastructure & Ops`

`Project Priority` uses `High` / `Medium` / `Low` values, not `P1` / `P2` / `P3`.

## Label Mappings

If a field is not explicitly supplied in metadata, the script can infer:

- `active-mvp` -> `Lane=active-mvp`
- `lane: deferred` -> `Lane=deferred`
- `blocked` or `status: blocked` -> `Status=Blocked`
- `triage` or `status: triage` -> `Status=Triage`
- `priority: high` -> `Project Priority=High`
- `priority: medium` -> `Project Priority=Medium`
- `priority: low` -> `Project Priority=Low`

If multiple conflicting lane, status, or priority labels are present, inference is skipped and a warning is logged.

`Ready` is human-approved and is not inferred from labels by this workflow.

## Defaults

- `Status=Inbox` when Status is currently empty and metadata does not explicitly set `status`.
- `Lane` remains unset unless metadata or label mapping provides a value.
- `Priority` remains unset unless metadata or label mapping provides a value.

## Mutation Rules

- Adds the issue to Project v2 if it is missing from the target project.
- Discovers field IDs and single-select option IDs dynamically from Project schema.
- Uses `updateProjectV2ItemFieldValue` for field updates.
- Does not overwrite existing field values from defaults or label inference.
- Metadata values are treated as explicit and may overwrite existing values for those fields.
- Missing optional Project fields are logged as warnings and skipped.
- Missing required Project fields fail the run (`Status`, `Lane`, `Project Priority`).
- Unknown single-select metadata values are logged as warnings and skipped.
- `--dry-run` performs no mutations.

## Required Variables, Secrets, and Permissions

Workflow Actions variable:

- `PROJECT_AUTOMATION_APP_ID`

Workflow Actions secrets:

- `PROJECT_AUTOMATION_PRIVATE_KEY`

Optional workflow Actions variable:

- `PROJECT_AUTOMATION_PROJECT` (defaults to `arbiter-systems/2` in workflow)

The script uses GitHub App authentication. It does not rely on `GITHUB_TOKEN` for org-level Project v2 mutation.

Practical GitHub App access requirements:

- Read issues in target repositories.
- Read and write target organization Project v2 items and fields.
- Access to the organization installation that owns the project.

## Dry-Run Usage

In workflow:

- Set repository or organization variable `PROJECT_FIELD_HYDRATION_DRY_RUN=true` to force dry-run.

Local script shape:

```bash
node scripts/hydrate-project-fields.js \
  --event-path /path/to/issues-event.json \
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
4. Set repository (or organization) variable:
   - `PROJECT_AUTOMATION_APP_ID`
5. Set repository (or organization) secret:
   - `PROJECT_AUTOMATION_PRIVATE_KEY`
6. Optionally set repository (or organization) variables:
   - `PROJECT_AUTOMATION_PROJECT` (default `arbiter-systems/2`)
   - `PROJECT_FIELD_HYDRATION_DRY_RUN` (`true` or `false`)
7. Open or edit an issue with labels/metadata and confirm workflow logs decisions and project item ID.
