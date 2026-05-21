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
priority: P1
blocked_by:
implementation_order:
area:
-->
```

Rules:

- `project` must be `org/number`.
- Keys are optional.
- Empty values are treated as "not explicitly supplied."
- Unknown metadata keys fail the run with a clear error.

## Label Mappings

If a field is not explicitly supplied in metadata, the script can infer:

- `active-mvp` -> `Lane=active-mvp`
- `ready` -> `Lane=ready`
- `blocked` -> `Lane=blocked`
- `priority: high` -> `Priority=P1`
- `priority: medium` -> `Priority=P2`
- `priority: low` -> `Priority=P3`

If multiple conflicting lane labels or priority labels are present, inference is skipped and a warning is logged.

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
