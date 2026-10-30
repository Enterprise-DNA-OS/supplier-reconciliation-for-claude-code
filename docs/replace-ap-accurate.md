# Replace the AP Accurate reconciliation desk

AP Accurate documents CSV, Excel and PDF statement input and matching against accounting records. Its public documentation does not specify an export format for proprietary matching history. The free importer accepts the original statement CSV and the accounting open-item CSV used for reconciliation. It does not pretend an invented template is a verified vendor export.

Sources checked 30 October 2026: [AP Accurate](https://360-ap.com/ap-accurate) and [integrations](https://360-ap.com/integrations).

1. Retain your AP Accurate reports and original supplier statements. Request an export of matching decisions, attachments, audit events and configuration from the vendor if you need them. They require separate mapping.
2. Obtain a complete supplier open-item statement and a complete ledger open-item extract for the same date, supplier and currency. Save CSV from the spreadsheet when needed. Do not include a balance-forward total among invoice lines. Keep the untouched original documents. PDF text extraction requires separate checked preparation.
3. Create the supplier in a migrated, empty business database. Copy examples/manifest.json to a private imports directory. Change supplier, filenames, keys, cutoff, currency and balance. Map each CSV header to the supported fields below. The examples are synthetic, not a captured vendor export.
4. Run `node scripts/reconcile.mjs import ap-accurate imports/manifest.json --actor="Operator" --dry-run`. Correct rejected dates, duplicated source IDs, unsupported amounts or balance differences. A blank date or amount is an error, never zero. Whole pairs are transactional.
5. Run the same command without --dry-run. Compare counts, signed control totals, credits and source identifiers. Run reconcile with the two source keys and investigate every unmatched row. Check the full pack against original documents before adopting it.

| Manifest map key | Default accepted headings | Treatment |
|---|---|---|
| source_id | Source ID, ID | Optional, otherwise stable row number |
| reference | Document Number, Invoice Number, Reference | Required, duplicate references retained for review |
| document_date | Document Date, Invoice Date | Required YYYY-MM-DD, not after cutoff |
| due_date | Due Date | Optional YYYY-MM-DD |
| amount | Document Amount, Amount, Open Amount | Required signed decimal amount, credit negative |

The manifest supplies supplier, currency, source key, cutoff and optional signed balance per batch. It can provide a map such as `{"reference":"Bill Ref","document_date":"Bill Date","amount":"Outstanding"}`. This changes header matching, not accounting meanings. All columns remain in the stored raw source rows and original CSV text.

Identical repeats skip. Any changed content or metadata using an existing source key rejects the full pair. Use new keys for corrected snapshots. Closed invoices, payments, bank details, portals, file attachments, prior reviews, tax breakdowns, automatic feeds and notification rules are not imported by this command. Preserve and migrate them separately where needed. Never infer a supplier's current payment position from an old snapshot.

One command imports the prepared source pair. Mapping, opening-balance agreement, history migration and live acceptance remain explicit tasks. Enterprise DNA handles those tasks in a custom installation. Keep your existing service until the owner approves the reconciled scope.
