# CLI reference

Run from the project directory. `node scripts/reconcile.mjs --help` lists syntax. Flags use --key=value, with quotes around values containing spaces. All commands accept --json. Monetary input is signed decimal units with at most two decimal places. Monetary output names ending in _cents are signed integer minor units. Only NZD, AUD, USD, GBP and EUR are accepted. No exchange-rate conversion occurs.

## suppliers

List suppliers.

`node scripts/reconcile.mjs suppliers`

## supplier

Read a supplier, source batches and notes.

`node scripts/reconcile.mjs supplier <selector>`

## statements

Check statement dates and control totals.

`node scripts/reconcile.mjs statements`

## ledger

Read ledger snapshots.

`node scripts/reconcile.mjs ledger`

## balances

Compare source control totals.

`node scripts/reconcile.mjs balances`

## runs

List reconciliation runs.

`node scripts/reconcile.mjs runs`

## run

Inspect every result and explanation.

`node scripts/reconcile.mjs run <selector>`

## attention

Read every open discrepancy.

`node scripts/reconcile.mjs attention`

## exceptions

Read the short discrepancy list.

`node scripts/reconcile.mjs exceptions`

## credit-chase

Review missing or disputed credits.

`node scripts/reconcile.mjs credit-chase`

## month-end

Prepare the month-end reconciliation review.

`node scripts/reconcile.mjs month-end`

## supplier-chase

Find absent or stale supplier statements.

`node scripts/reconcile.mjs supplier-chase`

## duplicates

Find repeated references within a source.

`node scripts/reconcile.mjs duplicates`

## follow-ups

Read dated supplier notes.

`node scripts/reconcile.mjs follow-ups`

## history

Read the append-only action log.

`node scripts/reconcile.mjs history`

## insights

Answer ten cross-record questions.

`node scripts/reconcile.mjs insights`

## add

Create a supplier.

`node scripts/reconcile.mjs add --code=<code> --name="<name>" --owner="<owner>" --actor="<operator>"`

## log

Append a supplier note and optional follow-up date.

`node scripts/reconcile.mjs log <supplier> --note="<note>" --due=YYYY-MM-DD --actor="<operator>"`

## import

Import original statement and ledger CSVs.

`node scripts/reconcile.mjs import ap-accurate <manifest.json> --actor="<operator>" --dry-run`

## reconcile

Compare a statement with a matching ledger cutoff.

`node scripts/reconcile.mjs reconcile <statement-key> <ledger-key> --actor="<operator>"`

## resolve

Record evidence explaining an exception.

`node scripts/reconcile.mjs resolve <finding-id> --note="<explanation>" --evidence="<source-reference>" --actor="<operator>"`

## review

Record an independent completed review.

`node scripts/reconcile.mjs review <run-id> --evidence="<review-record>" --actor="<reviewer>"`

## compliance

Check source controls and record completeness.

`node scripts/reconcile.mjs compliance`

## draft-supplier

Draft a supplier discrepancy note locally.

`node scripts/reconcile.mjs draft-supplier <supplier>`

## export

Write a complete portable evidence archive.

`node scripts/reconcile.mjs export --out=exports/<new-name>.json`

## Snapshot semantics

Each manifest is one supplier and one currency at one cutoff. Both sources must contain the complete open-item population for that scope. Balance-forward lines must not be mixed with itemised invoices. Payment rows and allocation history are outside this importer. Credits must be negative. A statement ending balance is optional but, when supplied, must equal the line sum exactly. CSV headings may be mapped explicitly. Preserve original values and source records.

Export writes a new JSON file containing all domain records, raw source CSVs, events and migration metadata. It never overwrites an existing file. It is a portable evidence archive, not a one-command database restore format.
