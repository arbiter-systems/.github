# CLAUDE.md

## Public repository guidance

This public repository contains organization-level GitHub metadata, public profile content, shared templates, and public-safe policy files.

Treat all content as public, indexed, and permanent.

## Scope

Use this repository for public-safe documentation and metadata only.

Do not add or expose:

- secrets, credentials, tokens, private links, account identifiers, or customer data
- internal roadmap, strategy, competitive analysis, governance details, or private architecture planning
- service contracts, runtime topology, local validation logs, implementation sequencing, or private issue references
- security findings, vulnerability baselines, audit worksheets, or known-gap reports

## Internal policy boundary

Detailed internal agent policy belongs in private company documentation, not in this public repository.

Keep public guidance high-level and public-safe.

## Git operations

- Do not create branches, commits, pushes, or pull requests unless explicitly requested.
- When branch creation is explicitly requested, branch from `main` and use a branch name containing both the GitHub issue number and a short issue-title slug, such as `123-update-pr-template-guidance`.
- Do not use vague branch names such as `fix-issue`, `implementation`, `updates`, or `codex-fix`.
- Read-only Git inspection is allowed.

## Review posture

For public documentation changes, check:

1. The content is public-safe.
2. Claims are accurate and supportable.
3. Private implementation details are omitted.
4. The change is limited to the requested scope.
5. Validation is documented, or the reason validation was not run is clear.
6. No unrelated formatting churn, refactors, or drive-by cleanup are mixed in.

When a best-practice rule conflicts with issue scope, preserve issue scope and document the tradeoff instead of expanding the implementation.

Use the pull request template checklist for scope, validation, and public/private boundary review.

Do not merge pull requests unless explicitly instructed by a human owner.
