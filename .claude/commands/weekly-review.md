# Monday supplier review

Read CLAUDE.md. Run these three commands and read the full results:

1. `node scripts/reconcile.mjs supplier-chase --json`
2. `node scripts/reconcile.mjs attention --json`
3. `node scripts/reconcile.mjs follow-ups --json`

Write a short review grouped by supplier and currency. Name missing statements, missing credits, disputed amounts, repeated references and overdue follow-ups. Distinguish explained discrepancies from unexplained ones. Date every observation. Do not claim a bill is unpaid because it appears in an old snapshot. Draft actions locally and never send or pay.
