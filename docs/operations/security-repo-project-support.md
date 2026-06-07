# Security Repository Project Support

## Purpose

Track the GitHub Project support required when the private `arbiter-systems/security` repository participates in Arbiter issue governance.

## Current status

The `security` repository exists and has a repo-local Project Field Hydration caller workflow.

Project field hydration can add and update issues only when hidden metadata values match the live GitHub Project single-select options. The `Repo` field is human-maintained, so `security` must exist as a live `Repo` option before issues should rely on `repo: security` metadata.

## Required setup

- Add `security` to the live GitHub Project `Repo` field options.
- Keep `Security & Compliance` as the Workstream value for security repo issues.
- Keep platform deferred until explicitly promoted.
- Do not create a `devops` repo.

## Validation

After the live Project option is added, edit or open one `arbiter-systems/security` issue and confirm:

- The repo-local hydration workflow runs.
- The issue is present in `arbiter-systems/2`.
- `Repo=security` hydrates without an unknown option warning.
- Other metadata values continue to use the documented live Project values.
