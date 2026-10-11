# Project instructions


## Mandatory UX and Design approval

Read docs/ux/UX_POLICY.txt and docs/ux/principles.json before designing or delivering any product. This applies to every Company and every tool produced by this project.

Evaluate all UX01–UX26 against the actual market, user, device and essential journeys. Do not mark a product compliant from code inspection, a successful build or a screenshot alone. Add relevant domain criteria when needed. Record real, version-specific evidence in docs/ux/audit.json. Never substitute synthetic test fixtures for product evidence.

Before release or publication run `npm run ux:gate`. A FAIL, UNVERIFIED, missing principle, missing contextual assessment, missing evidence, stale source fingerprint or unreviewed non-applicability blocks delivery. Do not bypass the gate, fabricate approval or remove mandatory criteria to make it pass. Use `npm run dev` for development and UX assessment; production build scripts enforce the gate after compilation.

A market-dependent implementation is required, not a generic visual style. Independent UX review plus technology and product approvals are mandatory. Read docs/ux/IMPLEMENTATION.txt for evidence format and current coverage. This mechanical validator cannot independently prove usability or authenticate reviewers.

Every generated Project Pack or Company handoff must carry this policy, the principle registry, the audit template and the release-check instruction. Blue Building Blueprint captures market and user context; Foundation defines the experience; Build implements it; Launch requires passing evidence; Business and Grow monitor outcomes and revalidate changes. A handoff is not an authenticated integration with another project.
