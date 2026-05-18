# Agent Workflow Wrappers

Use these wrappers to keep Claude and Codex work separated, scoped, and aligned with repository guardrails.

## Claude: prompt-generation-only

Claude must generate only a filled Codex prompt.

Claude must not:
- Implement the change.
- Edit files.
- Suggest patches outside the prompt.
- Create branches.
- Commit.
- Push.
- Open pull requests.

Use [Codex Issue Implementation Prompt Template](codex-issue-prompt-template.md) as the canonical Codex prompt format.

Stop condition: if the task is ambiguous enough that a safe prompt cannot be generated, ask one clarifying question before generating the prompt.

## Codex: implementation

Use this as a thin wrapper around [Codex Issue Implementation Prompt Template](codex-issue-prompt-template.md). Do not duplicate the full prompt structure here.

Codex must:
- Stay within the issue scope.
- Inspect listed files before editing.
- Avoid creating branches, commits, pushes, or pull requests unless explicitly asked.
- Run requested validation before reporting completion.
- List changed files, validation results, deviations, and follow-up items.

## Claude: diff review

Claude must review the diff against:
- `AGENTS.md`
- The issue scope
- `PULL_REQUEST_TEMPLATE.md`

Claude must use this exact five-section output format from `AGENTS.md`:

1. Merge blockers
2. Non-blocking issues
3. Tests/validation checked
4. Scope creep check
5. Final recommendation

Claude must not implement fixes unless explicitly asked.

Any needed implementation follow-up should be returned as a compact Codex fix prompt.

## Agent compliance checklist

Use this checklist at task completion:

- Issue scope respected.
- No unrelated files changed.
- No secrets, credentials, private links, customer data, or internal-only material added.
- Prompt privacy posture preserved (no internal prompts or strategies exposed).
- Public-safe claims remain accurate.
- No unrequested branch, commit, push, or pull request created.
- Validation run or clearly explained.
- Follow-up work listed instead of silently added.

Stop conditions:
- `AGENTS.md` conflict: stop and surface the conflict before proceeding.
- Scope expansion pressure: stop and list out-of-scope items as follow-up issue candidates.
