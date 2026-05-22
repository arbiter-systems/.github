# MVP Cost Controls

## Overview

MVP infrastructure and provider usage are intentionally bounded while the platform is in active development. This document is internal operating guidance, not a public pricing or customer commitment. The internal MVP target is $150-$300/month, and the private beta ceiling is $1,000/month. These thresholds should be adjusted as real usage data comes in.

## Budget Alert Thresholds

| Category | Warning | Review | Hard Review / Cap |
|---|---:|---:|---:|
| AWS | $100 | $200 | $300 |
| AI providers: OpenAI, Anthropic, etc. | $50 | $100 | $150 |
| Vercel | — | $20-$40 | — |
| GitHub Actions | — | $10-$25 | — |

AI provider spend should be treated as a hard review gate at $150/month during MVP unless a human owner explicitly approves higher usage.

## Threshold Actions

- Warning: review recent usage and identify the main cost driver.
- Review: pause non-essential usage and document the reason for the increase.
- Hard Review / Cap: require explicit human approval before increasing spend or continuing non-essential usage.

## What to Monitor Monthly

| Area | Check |
|---|---|
| AWS | Review Cost Explorer and Budgets console. |
| AI providers | Review usage dashboards per provider. |
| Vercel | Review project usage page. |
| GitHub Actions | Review Actions minutes and billable usage. |
| CloudWatch / logs | Review log volume and retention. |
| Prompt/payload privacy | Confirm raw prompt or payload logging remains disabled by default and any temporary opt-in logging is explicitly approved, minimized, and time-bounded. |

## Cost-Control Checklist

- [ ] AWS Budget alerts configured at $100 / $200 / $300.
- [ ] AI provider spend alerts configured per provider at $50 / $100 / $150.
- [ ] Vercel project spend alert or limit configured at $20-$40.
- [ ] GitHub Actions usage reviewed or alerted at $10-$25.
- [ ] CloudWatch log retention set to short defaults, such as 7-14 days for non-audit logs.
- [ ] Raw prompt and payload logging disabled by default in production; any temporary opt-in logging is explicitly approved, minimized, and time-bounded.
- [ ] Provider attempt limits enforced, including max retries and max attempts per request.
- [ ] Token and output limits configured on all LLM calls.
- [ ] Continuously hosted dev or staging environments are stopped overnight unless explicitly needed.
- [ ] Private beta total spend reviewed against the $1,000/month ceiling.

## Intentionally Deferred

Deferred / out of MVP scope:

- Runtime quota enforcement.
- Billing integration / Stripe.
- Infrastructure-as-code budget resources, unless already available.
- Cost dashboard.
- Analytics warehouse.
- Long-term trace storage.
- Multi-region planning.

## Related Service-Level Issues

Runtime work belongs in service repositories:

- Usage attribution per execution / per tenant: no issue yet; candidate follow-up: "feat(cost-control): add per-execution and per-tenant usage attribution"
- Provider guardrails: attempt limits, retry caps, token caps: arbiter-systems/control-plane-api#309
- Logging controls: payload redaction, payload logging defaults, retention: arbiter-systems/control-plane-api#270
- Provider-side usage and error normalization support: no issue yet; candidate follow-up: "feat(providers): add provider-side usage and error normalization support"