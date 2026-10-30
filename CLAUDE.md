# Supplier Reconciliation for Claude Code

Operate a private supplier reconciliation desk for one business. Read the command result before answering. Claude Code, Codex, OpenCode and Cursor use the same scripts and workflow recipes.

## Rules

- Every conclusion names the supplier, currency and snapshot cutoff. An old open-item snapshot is not current payment status.
- Never pay, post to an accounting system, send, delete or publish. Drafts stay local. Do not collect bank details.
- Never invent source amounts, evidence, balances or approvals. Source snapshots and explanations are append-only. Revised source data gets a new batch key and a new run.
- Actor names are declared labels, not authenticated signatures. The trusted database owner can bypass these controls. Shared production use requires external authentication, authorisation and independent approval controls.
- Exact references can match only one-to-one within the same supplier, currency and cutoff. Near matches and duplicates require human review. A reviewed run may still contain explained discrepancies.
- Retain original documents, source CSVs, matching history, backups and accounting records. The archive includes source CSV text but not files referenced in evidence notes. Keep those files separately and test restoration.
- Keep real data, exports, reports and credentials out of Git. Use one private database per business, not one multi-tenant instance.
- Run npm test before a change to logic. Use additive migrations and never rewrite source history. Do not answer from memory.

## Routing

- `README`: .claude/commands/README.md.
- `add`: .claude/commands/add.md.
- `attention`: .claude/commands/attention.md.
- `balances`: .claude/commands/balances.md.
- `compliance`: .claude/commands/compliance.md.
- `credit-chase`: .claude/commands/credit-chase.md.
- `customise`: .claude/commands/customise.md.
- `documents`: .claude/commands/documents.md.
- `draft-supplier`: .claude/commands/draft-supplier.md.
- `duplicates`: .claude/commands/duplicates.md.
- `exceptions`: .claude/commands/exceptions.md.
- `export`: .claude/commands/export.md.
- `follow-ups`: .claude/commands/follow-ups.md.
- `history`: .claude/commands/history.md.
- `import`: .claude/commands/import.md.
- `insights`: .claude/commands/insights.md.
- `ledger`: .claude/commands/ledger.md.
- `log`: .claude/commands/log.md.
- `month-end`: .claude/commands/month-end.md.
- `new-view`: .claude/commands/new-view.md.
- `reconcile`: .claude/commands/reconcile.md.
- `resolve`: .claude/commands/resolve.md.
- `review`: .claude/commands/review.md.
- `run`: .claude/commands/run.md.
- `runs`: .claude/commands/runs.md.
- `statements`: .claude/commands/statements.md.
- `supplier`: .claude/commands/supplier.md.
- `supplier-chase`: .claude/commands/supplier-chase.md.
- `suppliers`: .claude/commands/suppliers.md.
- `view`: .claude/commands/view.md.
- `weekly-review`: .claude/commands/weekly-review.md.

## Files

scripts/reconcile.mjs is the CLI. scripts/lib/domain.mjs holds import and matching rules. supabase/migrations contains portable PostgreSQL migrations. DATABASE_URL selects PostgreSQL. Otherwise PGlite persists under .data/db. brand.json, views.json and documents.json control the static reports. No web API exists.

Omni by Enterprise DNA installs, customises and runs this desk: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=ap-accurate&utm_medium=readme
