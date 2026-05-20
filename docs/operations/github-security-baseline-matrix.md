# GitHub Security Feature Baseline Matrix

## Purpose

This matrix distinguishes Required, Optional, Not Applicable, Blocked, and Deferred security controls across active Arbiter repositories. It records the expected baseline posture by repo type. It does not configure or verify live GitHub repository settings. It helps avoid treating docs-only/admin repos as failures when application-code controls do not apply.

## Verification Boundary

This document records documented expectations and classification rules. It does not confirm live repository settings. Live verification requires GitHub owner/admin access. Any live mismatch should be tracked as remediation or owner/admin verification work, not silently assumed.

## Status Taxonomy

| Status | Meaning |
|---|---|
| Required | Control must be enabled for this repo; absence is a remediation gap. |
| Optional | Control is available and useful but not required at MVP stage. |
| Not Applicable | Control does not apply to this repo by type, language, or content. |
| Blocked | Control is unavailable due to GitHub plan, visibility, permissions, or feature gating. Track as a known constraint. |
| Deferred | Control applies in principle but is intentionally deferred to a later phase. |

## Repository Type Classifications

| Repo | Repo Type | Classification Notes |
|---|---|---|
| .github | documentation/admin | Public org/defaults and governance docs repository. |
| internal-roadmap | documentation/admin | Private planning/admin repository. |
| control-plane-api | application/code | .NET API repository. |
| ai-execution-service | application/code | .NET service repository. |
| arbiter-console | application/code | Frontend application repository. |
| arbiter-site | application/code | Frontend/docs hybrid repository. |

## Policy Notes

- CodeQL / code scanning is Required for application/code repos where GitHub supports it.
- CodeQL / code scanning is Not Applicable for documentation-only and planning/admin repos; absence is not a failure.
- If CodeQL / code scanning is applicable but unavailable due to GitHub plan, visibility, permissions, or feature gating, classify it as Blocked with a note.
- Secret scanning and secret scanning push protection are Required or Blocked for all repos; they should never be silently absent.
- Dependabot security alerts are Required wherever a dependency graph is detected.
- Dependabot version updates are Deferred until dependabot.yml with grouping and cadence rules is in place.
- GitHub Advanced Security / plan-gated features are tracked as Blocked when unavailable or unverified, not silently ignored.
- Hosted-demo-relevant Blocked items must be clearly marked in the Notes column.

## Baseline Matrix

| Repo | Repo Type | Private Vuln Reporting | Dependency Graph | Dependabot Alerts | Dependabot Malware Alerts | Prevent Direct Dependabot Dismissals | Dependabot Security Updates | Grouped Security Updates | Dependabot Version Updates | CodeQL / Code Scanning | Copilot Autofix | Prevent Direct Code-Scanning Dismissals | Code Scanning Failure Threshold | Secret Scanning | Secret Scanning Push Protection | Alert Access / Security Manager | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| .github | documentation/admin | Optional | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Required | Required | Blocked (owner/admin verification required) | docs/admin repo; application-code scanning absence is not a failure; dependency graph may detect Actions workflows if present |
| internal-roadmap | documentation/admin | Optional | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Not Applicable | Required | Required | Blocked (owner/admin verification required) | private docs/admin repo; Advanced Security availability may be plan/visibility gated; alert access verification is lower execution risk than application repos |
| control-plane-api | application/code | Optional | Required | Required | Optional | Blocked (owner/admin verification required) | Required | Deferred | Deferred | Required | Optional | Blocked (owner/admin verification required) | Optional | Required | Required | Blocked (owner/admin verification required) | Hosted-demo relevant; unresolved CodeQL / code scanning, secret scanning, or push protection availability is a hosted-demo blocker; alert access ownership required for operational response |
| ai-execution-service | application/code | Optional | Required | Required | Optional | Blocked (owner/admin verification required) | Required | Deferred | Deferred | Required | Optional | Blocked (owner/admin verification required) | Optional | Required | Required | Blocked (owner/admin verification required) | Hosted-demo relevant; unresolved CodeQL / code scanning, secret scanning, or push protection availability is a hosted-demo blocker; alert access ownership required for operational response |
| arbiter-console | application/code | Optional | Required | Required | Optional | Blocked (owner/admin verification required) | Required | Deferred | Deferred | Required | Optional | Blocked (owner/admin verification required) | Optional | Required | Required | Blocked (owner/admin verification required) | frontend application repo; CodeQL support depends on language detection and GitHub support; alert access ownership required for operational response |
| arbiter-site | application/code | Optional | Required | Required | Optional | Blocked (owner/admin verification required) | Required | Deferred | Deferred | Required | Optional | Blocked (owner/admin verification required) | Optional | Required | Required | Blocked (owner/admin verification required) | frontend/docs hybrid repo; CodeQL support depends on language detection and GitHub support; alert access ownership required for operational response |

## Owner/Admin Verification

Live repository settings must be verified by a GitHub owner/admin. Use the existing audit worksheet: [GitHub security audit](github-security-audit.md). This matrix is a baseline policy reference, not proof of live enforcement.

## Related Documents

- [GitHub security audit](github-security-audit.md)
- [Dependency vulnerability baseline](dependency-vulnerability-baseline.md)
- [Branch protection and merge policy](branch-protection-and-merge-policy.md)
