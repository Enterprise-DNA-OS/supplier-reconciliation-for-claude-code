# Verification

Checked 30 October 2026.

- Linux, Node 22, PGlite: npm test PASS, 118 checks on the final CLI formatting.
- Standalone PostgreSQL 18: npm test PASS, 115 checks before the display-only table formatting update. Migration, import, matching, review, restricted-role and document checks passed.
- npm run demo, npm run view and npm run docs: PASS. Two views and four demo documents rendered.
- 31 workflow commands. Every CLI read and each mutation path is exercised by the smoke suite.
- Three actual demo command captures are in docs/demo-output.md. The page gate passed with no brand errors.
- Hosted Windows/Linux workflow did not execute tests. GitHub reports an account billing/spending restriction. Windows remains unverified. Run: https://github.com/Enterprise-DNA-OS/supplier-reconciliation-for-claude-code/actions/runs/41137934680 .
- Browser preview using the exact shared Astro route and components: HTTP 200, noindex,nofollow, all three offer paths, six attributed booking links, zero page errors, no mobile overflow. Desktop and mobile screenshots were inspected. The preview omitted unrelated content collections. The full marketing-site build was not run.
- The generated report was inspected on mobile. Wide data remains horizontally scrollable inside each section, without page overflow.

The test database and records were isolated and synthetic. No business database, payment system or customer record was changed.
