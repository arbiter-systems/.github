# Security Policy

## Supported Versions

Arbiter Systems AI service is currently pre-release software.

Security updates are applied to the active `main` branch only unless otherwise documented.

Older branches, experimental branches, local development branches, forks, and abandoned feature branches are not supported for security fixes.

## Reporting a Vulnerability

Do not open public GitHub issues for suspected vulnerabilities.

Report security concerns privately to:

**security@arbitersystems.ai**

Include as much detail as possible:

- Repository: `arbiter-systems/ai-service`
- Affected endpoint, route, workflow, package, configuration, or execution path
- Reproduction steps
- Expected impact
- Whether secrets, tenant data, prompts, completions, provider credentials, execution metadata, traces, receipts, policy decisions, or logs may be exposed
- Any relevant logs, request examples, screenshots, commit references, or dependency versions
- Whether the issue is actively exploitable or theoretical

## Response Expectations

Arbiter Systems will make a best effort to:

1. Acknowledge receipt of the report.
2. Assess severity and reproducibility.
3. Prioritize fixes based on exploitability, data exposure risk, tenant isolation impact, execution safety impact, and operational risk.
4. Credit the reporter when appropriate and requested.

Please allow reasonable time for investigation and remediation before public disclosure.

## In Scope

Security reports are especially useful when they involve:

- Authentication or authorization bypass
- Internal service authentication weaknesses
- Tenant isolation failures
- Secret leakage
- Provider credential exposure
- Prompt, completion, trace, receipt, execution metadata, or policy decision leakage
- Unsafe logging or error response exposure
- Request validation bypass
- Unsafe execution behavior
- Provider routing, fallback, retry, or timeout behavior that causes unsafe execution
- SSRF, injection, deserialization, path traversal, command execution, or similar application vulnerabilities
- Dependency vulnerabilities exploitable through the service
- CI/CD, GitHub Actions, container, or deployment configuration weaknesses
- Misconfigured CORS, security headers, or public API exposure

## Out of Scope

The following are generally out of scope unless they demonstrate concrete security impact:

- Automated scanner findings without exploitability analysis
- Missing security headers on local-only development endpoints
- Denial-of-service findings without practical impact
- Social engineering
- Physical attacks
- Issues requiring compromised developer machines
- Attacks against third-party providers outside Arbiter Systems control
- Theoretical dependency issues that are not reachable or exploitable
- Public information disclosure that does not expose secrets, private data, prompts, completions, traces, execution metadata, provider credentials, or tenant-specific information

## Data Handling and Privacy Boundary

The AI service should treat all execution inputs, request metadata, provider responses, error details, tenant identifiers, routing decisions, traces, receipts, and logs as security-sensitive.

Raw prompts and completions should not be logged or persisted by default. Any future storage, export, replay, analytics, or debugging path involving prompts, completions, traces, receipts, provider responses, or tenant-specific execution metadata must be explicitly reviewed before use.

## Security Design Priorities

The AI service security posture prioritizes:

- Tenant-aware request handling
- Prompt privacy by default
- Secret-safe logging
- Safe provider authentication
- Minimal exposure of execution internals
- Safe timeout, retry, and fallback behavior
- Conservative request validation
- Safe error responses
- Reproducible execution evidence without leaking sensitive content
- Explicit review before adding persistence, replay, analytics, or prompt/completion storage

## Coordinated Disclosure

Please do not publicly disclose a vulnerability until Arbiter Systems has had reasonable time to investigate and address it.

Public issues may be deleted or converted to private follow-up work when they contain sensitive details.
