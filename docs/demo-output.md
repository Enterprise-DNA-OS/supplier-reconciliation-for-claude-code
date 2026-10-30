# Real demo command captures

Synthetic data. Captured 30 October 2026. Amount columns ending in cents are integer minor units.

## Source controls

Do the supplier and ledger totals agree?

```text
node scripts/reconcile.mjs balances
supplier  kind       as of       currency  total    declared
  --------  ---------  ----------  --------  -------  --------
  HARBOUR   ledger     2026-09-30  NZD       2365.00  2365.00 
  HARBOUR   statement  2026-09-30  NZD       2000.00  2000.00
```

## Discrepancies

Which items need checking before the review is finished?

```text
node scripts/reconcile.mjs exceptions
supplier  currency  reference  outcome            review state
  --------  --------  ---------  -----------------  ------------
  HARBOUR   NZD       CN-33      missing-ledger     needs-review
  HARBOUR   NZD       DUP-10     ambiguous          needs-review
  HARBOUR   NZD       DUP-10     ambiguous          needs-review
  HARBOUR   NZD       DUP-10     missing-statement  needs-review
  HARBOUR   NZD       INV-101    amount-difference  needs-review
  HARBOUR   NZD       INV-104    missing-statement  needs-review
  HARBOUR   NZD       INV-109    missing-statement  needs-review
  HARBOUR   NZD       INV/104    near-match         needs-review
```

## Statement chase

Which suppliers have no recent statement?

```text
node scripts/reconcile.mjs supplier-chase
code        name                              owner       latest statement  days since statement
  ----------  --------------------------------  ----------  ----------------  --------------------
  HARBOUR-AU  Harbour Packaging Australia Demo  Lee         unknown           unknown             
  SOUTH       Southland Components Demo         Unassigned  unknown           unknown
```
