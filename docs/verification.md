# Verification

Checked 30 October 2026.

- Linux, Node 22, PGlite: npm test PASS, 118 checks on the final CLI formatting.
- Standalone PostgreSQL 18: npm test PASS, 115 checks before the display-only table formatting update. Migration, import, matching, review, restricted-role and document checks passed.
- npm run demo, npm run view and npm run docs: PASS. Two views and four demo documents rendered.
- 31 workflow commands. Every CLI read and each mutation path is exercised by the smoke suite.
- Three actual demo command captures are in docs/demo-output.md. The page gate passed with no brand errors.
- Hosted Windows/Linux checks and page visual validation are recorded after the private push. No Windows result is claimed yet.

The test database and records were isolated and synthetic. No business database, payment system or customer record was changed.
