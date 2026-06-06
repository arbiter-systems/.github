# Batch Project Field Hydration

## Purpose

Use batch project field hydration when many issues need Project v2 field hydration but issue-event automation is not safe.

This process is intentionally bounded and manually started. It does not run from issue events, pull request events, or schedules.

## Safety model

- Discovery is limited to explicitly supplied repositories.
- Candidate processing is limited by an explicit maximum count.
- Hydration runs sequentially, not in parallel.
- Dry-run is the default behavior.
- Write mode requires an explicit write flag and a separate write-enable environment gate.
- The process stops on first failure unless continue-on-error is explicitly requested.

## Candidate discovery

The batch script treats an open issue as a hydration candidate when either condition is true:

- the issue body contains an `arbiter-project` metadata block
- the issue has a known hydration-relevant label such as priority, status, lane, blocked, or triage labels

Pull requests are skipped.

## Dry run

Run a bounded preview before any write:

```bash
node scripts/batch-project-field-hydration.cjs \
  --repo arbiter-systems/control-plane-api,arbiter-systems/ai-execution-service \
  --limit 10 \
  --project arbiter-systems/2
```

Dry-run output includes the candidates found and invokes the existing single-issue hydration script in dry-run mode for each candidate.

## Candidate-only mode

To inspect candidates without invoking hydration:

```bash
node scripts/batch-project-field-hydration.cjs \
  --repo arbiter-systems/control-plane-api \
  --limit 10 \
  --candidates-only
```

## Write mode

After reviewing dry-run output, enable write mode only for a small bounded run:

```bash
BATCH_PROJECT_HYDRATION_WRITE_ENABLED=true \
node scripts/batch-project-field-hydration.cjs \
  --repo arbiter-systems/control-plane-api \
  --limit 10 \
  --project arbiter-systems/2 \
  --write
```

## Optional updated-since filter

Use `--since` to reduce the scan window:

```bash
node scripts/batch-project-field-hydration.cjs \
  --repo arbiter-systems/control-plane-api \
  --limit 10 \
  --since 2026-06-01T00:00:00Z
```

## Validation

```bash
node scripts/hydrate-project-fields.cjs --self-test
node scripts/batch-project-field-hydration.cjs --self-test
```
