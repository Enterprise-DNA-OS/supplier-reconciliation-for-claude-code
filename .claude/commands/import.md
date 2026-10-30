# Import original statement and ledger CSVs

Read CLAUDE.md. Run `node scripts/reconcile.mjs import ap-accurate <manifest.json> --actor="<operator>" --dry-run` from the repo root. Replace placeholders with values the operator supplied. Add `--json` for structured results.

Read the returned records before answering. State supplier, currency and snapshot date. An ambiguous selector lists candidates and exits with an error. Never choose the first match. Never invent source evidence, explanations or a reviewer. Actor labels are declarations, not authenticated signatures.

Read docs/replace-ap-accurate.md and the untouched input files first. Run the dry run, compare counts, signed totals, dates and currency, then remove --dry-run to apply the approved mapping. Both batches import atomically. Source CSVs contain open items at the same cutoff. No prior match or approval history is inferred.
