# Write a complete portable evidence archive

Read CLAUDE.md. Run `node scripts/reconcile.mjs export --out=exports/<new-name>.json` from the repo root. Replace placeholders with values the operator supplied. Add `--json` for structured results.

Read the returned records before answering. State supplier, currency and snapshot date. An ambiguous selector lists candidates and exits with an error. Never choose the first match. Never invent source evidence, explanations or a reviewer. Actor labels are declarations, not authenticated signatures.

Create the exports directory if it does not exist. The destination must be a new file. Keep this archive private, outside Git. It contains raw source records. See docs/operations.md for backup and restoration.
