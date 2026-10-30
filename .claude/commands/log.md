# Append a supplier note and optional follow-up date

Read CLAUDE.md. Run `node scripts/reconcile.mjs log <supplier> --note="<note>" --due=YYYY-MM-DD --actor="<operator>"` from the repo root. Replace placeholders with values the operator supplied. Add `--json` for structured results.

Read the returned records before answering. State supplier, currency and snapshot date. An ambiguous selector lists candidates and exits with an error. Never choose the first match. Never invent source evidence, explanations or a reviewer. Actor labels are declarations, not authenticated signatures.
