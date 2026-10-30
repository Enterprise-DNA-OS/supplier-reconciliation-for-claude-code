# Record an independent completed review

Read CLAUDE.md. Run `node scripts/reconcile.mjs review <run-id> --evidence="<review-record>" --actor="<reviewer>"` from the repo root. Replace placeholders with values the operator supplied. Add `--json` for structured results.

Read the returned records before answering. State supplier, currency and snapshot date. An ambiguous selector lists candidates and exits with an error. Never choose the first match. Never invent source evidence, explanations or a reviewer. Actor labels are declarations, not authenticated signatures.

Explain every exception first and verify its evidence. The reviewer must differ from the run preparer and every exception preparer. Reviewed means the review is complete, not that amounts agree or that any payment is approved.
