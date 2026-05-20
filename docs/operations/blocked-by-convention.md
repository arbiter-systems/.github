# Blocked By Convention

## Purpose

This convention defines the only issue-body syntax that automation may use to synchronize the GitHub Project v2 `Blocked By` field.

Automation must not infer blockers from free-form prose.

## Supported `Blocked by` Header Syntax

The header must start at the beginning of a line (allowing optional Markdown heading or bold prefix):

- `## Blocked by`
- `### Blocked by`
- `**Blocked by:**`
- `Blocked by:`

Supported headers must appear on their own line. Inline forms such as `Blocked by: #123` are not supported.
List blocker references on following lines.

Example:

```markdown
Blocked by:
- arbiter-systems/control-plane-api#276
- #103
```

Parser exclusions:

- Ignore matches inside fenced code blocks.
- Ignore matches inside HTML comments.
- Ignore matches inside Markdown block quotes.
- Do not infer blockers from prose.

## Recommended Placement

Place the `Blocked by` section in the issue body under a dependencies area when possible, for example:

- `## Dependencies`
- `## Blocked by`

## Supported Blocker Reference Formats

The parser supports these reference forms:

- bare `#NNN`
- `org/repo#NNN`
- `https://github.com/org/repo/issues/NNN`

Normalization output is always repo-qualified:

- `org/repo#NNN`

For multiple blockers, use one consistent separator:

- comma-separated (`a/b#1, a/b#2`)
- newline-separated (`a/b#1` on one line, `a/b#2` on the next line)

A `Blocked by` section ends at the next Markdown heading, thematic break (`---`, `***`, or `___`), or end of document.

## Clearing Blockers

To clear blockers:

1. Keep a supported `Blocked by` header in the issue body.
2. Remove all blocker references from that section.

When the section exists but contains no supported references, automation clears `Blocked By`:

- Preferred behavior: `clearProjectV2ItemFieldValue` for the text field.
- Fallback behavior (only when clear mutation support is unavailable or schema-incompatible): set `{ text: "" }`.

The fallback leaves an empty text value rather than a null field.

If no supported `Blocked by` section exists, automation leaves the `Blocked By` Project field unchanged.

## Mutation Scope

By default, automation mutates only:

- `Blocked By` Project field

Optional status mutation is disabled by default. It may run only when explicitly enabled with:

- `UPDATE_STATUS_BLOCKED=1`

When enabled, automation may set:

- `Status = Blocked`

Automation never auto-unblocks `Status`. Resolved or removed blockers do not automatically move an item out of `Blocked`.

## Never Mutated By This Automation

This automation never mutates:

- labels
- milestones
- priority
- lane
- phase
- implementation readiness
- comments
- issue bodies

## Token and Project Access

At a practical level, the token used by automation must be able to:

- read issues in target repositories
- read and write fields for the target GitHub Project v2

This document intentionally does not claim narrower or more precise scopes.

Workflow variable expectation:

- `ARBITER_PROJECT_NUM` should be set as an organization or repository Actions variable and passed to the script as `${{ vars.ARBITER_PROJECT_NUM }}`.
- The script fails fast when `GH_PROJECT_NUM` is missing or not an integer.

## Security and Logging Rules

Automation and workflow logs must:

- never print tokens or auth headers
- never echo full issue body content
- avoid exposing private roadmap details in public logs

For unresolved references, log only the unresolved reference token, not surrounding issue text.
