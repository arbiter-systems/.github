# SOC 2 Readiness Notes

Status: lightweight readiness notes  
Scope: MVP security posture, future evidence planning, and compliance-language guardrails

## Current status

Arbiter Systems is **not SOC 2 certified**.

These notes do not start a formal SOC 2 program, define legal policies, engage an auditor, or claim compliance. They provide a lightweight internal/public-safe reference for avoiding overclaims while the MVP moves toward hosted demos and customer pilots.

## Approved wording

Use guarded language:

- Arbiter is building security and privacy hygiene into the MVP.
- Arbiter is tracking future SOC 2 readiness areas.
- Arbiter is not currently SOC 2 certified.
- Arbiter uses metadata-first prompt/privacy posture in MVP documentation and examples.
- Arbiter avoids storing raw prompts by default where the implementation supports that behavior.

## Wording to avoid

Do not say:

- Arbiter is SOC 2 compliant.
- Arbiter is SOC 2 certified.
- Arbiter is audit-ready.
- Arbiter meets all Trust Services Criteria.
- Arbiter has formally implemented a SOC 2 control framework.
- Arbiter guarantees compliance for customers.

## MVP security posture

Current MVP security posture should be described as engineering security hygiene, not formal compliance readiness.

Relevant posture themes:

- no raw prompt logging by default
- metadata-first receipts and examples
- synthetic demo data and fixtures
- no secrets in public examples
- safe error responses without stack traces
- repository-level security setting checks tracked separately
- small scoped changes with reviewable PRs
- issue-linked implementation and validation notes

This posture supports safer demos and future readiness work, but it is not equivalent to a SOC 2 program.

## Future control areas

Likely future SOC 2 readiness areas include:

| Area | Future evidence examples |
| --- | --- |
| Access control | User access reviews, least-privilege records, owner/admin access logs, MFA expectations. |
| Change management | PR review evidence, linked issues, validation commands, release notes, rollback notes. |
| Incident response | Incident playbooks, severity definitions, post-incident review records, notification procedures. |
| Vendor/provider management | AI provider inventory, cloud provider inventory, vendor risk notes, data handling boundaries. |
| Secrets handling | Secret scanning settings, push protection records, rotation notes, environment variable inventory. |
| Logging and monitoring | Log-safety tests, metadata-only logging notes, alerting plans, retention boundaries. |
| Data retention | Retention policy for receipts, traces, logs, demo data, and customer data. |
| Prompt/privacy handling | Prompt privacy mode docs, sensitive context routing notes, raw-prompt storage boundaries. |
| Risk assessment | Risk register, mitigation plans, threat model notes, security backlog review cadence. |
| Availability | Health checks, readiness checks, provider fallback behavior, hosted-demo runbooks. |

## Evidence already collected or planned

Current and planned evidence should be treated as informal readiness material until a formal program exists.

Examples:

- issue and PR history linked to implementation work
- validation commands in PR descriptions
- security and privacy guardrail docs
- prompt/privacy examples and fixture constraints
- demo smoke test checklist
- accessibility and content claim checklists
- future repository security setting verification
- future runtime leakage validation
- future hosted-demo runbooks

## Gaps before customer pilots

Before customer pilots, Arbiter should avoid formal compliance claims and close or explicitly track gaps such as:

- live repository security setting verification
- secrets and push-protection status by repo
- hosted-demo secret handling model
- runtime log leakage validation
- incident response contact and intake process
- customer data handling statement
- data retention boundaries for receipts, traces, logs, and demo data
- provider/vendor inventory
- basic access review process
- backup/recovery expectations for hosted-demo components

## MVP security hygiene vs formal compliance readiness

| Topic | MVP security hygiene | Formal SOC 2 readiness |
| --- | --- | --- |
| Access control | Restrict admin access and avoid unnecessary collaborators. | Periodic access reviews and documented control evidence. |
| Change management | Use scoped issues, branches, PRs, and validation notes. | Formal change policy, approvals, release records, and audit evidence. |
| Secrets | Avoid secrets in code, docs, logs, fixtures, and screenshots. | Secret inventory, scanning evidence, rotation policy, and access controls. |
| Logging | Keep logs metadata-first and avoid raw prompt/provider payload leakage. | Monitoring controls, retention policy, alerting evidence, and review cadence. |
| Incident response | Track issues and failures. | Documented incident plan, severity model, roles, and postmortems. |
| Vendor management | Know which cloud and AI providers are used. | Vendor risk review, data processing boundaries, and review cadence. |

## Backlog candidates

Future issues may define:

- security evidence register
- vendor/provider inventory
- lightweight incident response playbook
- data retention policy draft
- customer data handling statement
- repository security settings evidence checklist
- secret rotation and environment variable inventory
- runtime log leakage validation evidence
- access review checklist
- hosted-demo security boundary document

## Non-goals

These notes do not implement:

- formal SOC 2 program
- auditor engagement
- certification claim
- legal policy generation
- runtime behavior changes
- production security redesign
- customer-facing compliance commitments
- formal Trust Services Criteria mapping

## Review guidance

When reviewing public or customer-facing material, reject copy that claims SOC 2 compliance or certification. Prefer copy that states Arbiter is building toward strong security and privacy hygiene while clearly noting that formal certification has not been completed.
