# Draft a supplier discrepancy note locally

Read CLAUDE.md. Run `node scripts/reconcile.mjs draft-supplier <supplier>` from the repo root. Replace placeholders with values the operator supplied. Add `--json` for structured results.

Read the returned records before answering. State supplier, currency and snapshot date. An ambiguous selector lists candidates and exits with an error. Never choose the first match. Never invent source evidence, explanations or a reviewer. Actor labels are declarations, not authenticated signatures.

Show the draft path and text in chat. Review before any external use. This workflow never sends.
