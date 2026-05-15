# Web and Console Timing Checklist

## 1. Purpose

This document sequences public website, documentation site, and Arbiter Console work against backend MVP milestones so engineering focus stays on the Control Plane and AI Execution Service.

## 2. Recommended Sequence

### Phase 1 - Now: Repo credibility

Trigger conditions:

- Backend MVP work is still the primary engineering focus.
- Public repository surfaces need to look credible enough for early technical review.

Scope:

- Finish GitHub organization profile README.
- Clean per-repo READMEs.
- Add architecture overview docs.
- Add project file map / onboarding links.
- Ensure CI is passing where available.
- Add a basic contact path.

Non-goals:

- Build a public website.
- Build Arbiter Console.
- Add marketing pages.
- Add product flows or user onboarding.

### Phase 2 - Soon: Minimal public website

Trigger conditions:

- All entry criteria are true.

Entry criteria:

- GitHub org looks credible.
- Core repos have clean READMEs.
- Architecture docs exist.
- CI is passing.
- Arbiter Systems can be explained in one sentence.

Scope:

- Build a minimal public website.
- Use `Astro + Starlight + TypeScript + Tailwind`.
- Deploy with Cloudflare Pages as the simplest option, or S3 + CloudFront when AWS-native deployment is preferred.
- Use static generation by default.
- Keep the site focused on credibility and documentation access.

Non-goals:

- Build Arbiter Console.
- Add pricing, billing, subscriptions, or public customer onboarding.
- Add a full marketing website.
- Add dynamic application workflows.

### Phase 3 - After backend MVP foundation: Upgrade docs, plan Console

Trigger conditions:

- Control Plane and AI Execution Service entry criteria are met.

Entry criteria - Control Plane has:

- policy decisions.
- provider routing.
- resilience.
- traces.
- outcome classification.
- usage/cost placeholders.
- health-aware routing.

Entry criteria - AI Execution Service has:

- provider execution boundary.
- deterministic fake provider.
- readiness checks.
- stable v1 NDJSON contract.
- compatibility tests.

Scope:

- Upgrade documentation structure and consistency.
- Plan Arbiter Console around backend API readiness.
- Identify operational screens that are justified by available backend capabilities.

Non-goals:

- Build the Console before backend APIs are coherent.
- Add a Console stack recommendation.
- Add advanced operational UI before the MVP foundation exists.
- Expand marketing site scope.

### Phase 4 - Before pilots/users/funding: Polish marketing site

Trigger conditions:

- All entry criteria are true.

Entry criteria:

- working demo.
- clear customer profile.
- clear pain point.
- screenshots or diagrams.
- internal console.
- deployment story.
- contact or waitlist flow.

Scope:

- Polish the public marketing site.
- Use screenshots or diagrams that reflect the working demo.
- Make contact or waitlist flow visible.

Non-goals:

- Substitute marketing polish for backend MVP readiness.
- Add unsupported product claims.
- Add private roadmap, competitive strategy, or internal planning details.

## 3. Options Matrix

| Option | Description | When to pick | Cost |
| --- | --- | --- | --- |
| A | GitHub organization profile only | Best immediate step; developer-native credibility | Free and fast |
| B | Minimal static public website | Best soon; credibility and docs surface | Low |
| C | Documentation-first website | After architecture docs and READMEs are consistent | Low to moderate |
| D | Full marketing website | After MVP/demo readiness | Moderate |
| E | Arbiter Console | After backend APIs are coherent enough for operational screens | Moderate to high |

## 4. Out of Scope (Now)

- pricing
- billing
- subscriptions
- team management
- public customer onboarding
- advanced analytics
- marketplace
- replay UI
- CMS
- blog engine

## 5. Acceptance Criteria

- [ ] Timing sequence is documented and visible in the org backlog
- [ ] Public site and console remain separate efforts
- [ ] The first website is scoped as a lean credibility/docs site
- [ ] The console is gated behind backend MVP readiness
- [ ] Polished marketing work is explicitly deferred until demo/pilot readiness
