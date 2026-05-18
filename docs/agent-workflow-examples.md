# Agent Workflow Examples

Use these examples as reusable patterns for choosing the right wrapper and reporting shape. Do not copy internal-only details into prompts or reports.

## Docs-only task

Task description: add or update public documentation for one issue without changing product code or automation.

Wrapper to use: `Codex: implementation` from [Agent Workflow Wrappers](agent-workflow-wrappers.md).

Key fields or instructions to fill in:
- List only the documentation files to inspect and change.
- State that the work is documentation only.
- Include public-safety constraints and any files that must not be edited.
- Use repository-documented markdown validation or a rendered markdown inspection where practical.

Expected completion/reporting shape:
- Changed files.
- Summary of documentation added or updated.
- Validation commands and results.
- Deviations or limitations.
- Follow-up issue candidates, if any.

## Test-only task

Task description: add or adjust tests for existing behavior without changing runtime behavior.

Wrapper to use: `Codex: implementation` from [Agent Workflow Wrappers](agent-workflow-wrappers.md).

Key fields or instructions to fill in:
- Identify the test files to inspect and change.
- Name the behavior under test and the acceptance criteria.
- State that product behavior should remain unchanged.
- Provide the exact test command to run.

Expected completion/reporting shape:
- Changed test files.
- Summary of coverage added or adjusted.
- Test command output or concise result.
- Any skipped validation with explanation.
- Follow-up issue candidates, if any.

## Implementation task

Task description: make a bounded code change for one accepted issue.

Wrapper to use: `Claude: prompt-generation-only` when preparing the Codex prompt, then `Codex: implementation` when making the change.

Key fields or instructions to fill in:
- Fill the Codex prompt using [Codex Issue Implementation Prompt Template](codex-issue-prompt-template.md).
- Include files to inspect before editing.
- Separate required changes from out-of-scope work.
- Include validation commands from the target repository.
- Preserve existing public contracts unless the issue explicitly requires a change.

Expected completion/reporting shape:
- Changed files.
- Summary of implementation.
- Validation commands and results.
- Deviations from the prompt, if any.
- Follow-up issue candidates, if any.

## Diff-review task

Task description: review a proposed diff for correctness, scope control, and repository guardrail compliance.

Wrapper to use: `Claude: diff review` from [Agent Workflow Wrappers](agent-workflow-wrappers.md).

Key fields or instructions to fill in:
- Provide the issue scope and diff to review.
- Identify any files or directories to exclude.
- Require review against `AGENTS.md` and `PULL_REQUEST_TEMPLATE.md`.
- Ask for implementation follow-up as a compact Codex fix prompt only when fixes are needed.

Expected completion/reporting shape:
- Merge blockers.
- Non-blocking issues.
- Tests/validation checked.
- Scope creep check.
- Final recommendation.
