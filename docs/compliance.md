# Record checks and their limits

Checked 30 October 2026. This is a supplier reconciliation record tool. It does not carry out payments, submit tax, certify a supplier balance or provide an audit opinion.

| Rule | What runs | Basis |
|---|---|---|
| SOURCE-BALANCE | Flag source batches without a stated control balance. Imports reject a supplied balance that differs from line totals. | Internal reconciliation control, not a statutory threshold. |
| OWNER | Flag active suppliers without an assigned owner. | Internal accountability policy. |
| UNRESOLVED | Flag discrepancies without an evidence-backed explanation. Review completion requires all explanations and a separate reviewer label. | Internal review policy, not authenticated approval. |
| STALE-SOURCE | Flag snapshots more than 31 days old. | Configurable operational cadence, not a legal deadline. |
| Evidence retention | Source records, resolutions and action history reject UPDATE and DELETE. Export includes original CSV text. No expiry job or delete command exists. | NZ Inland Revenue requires business records to be retained for at least seven tax years. Actual records and backups remain the owner's responsibility. |

[IRD record keeping](https://www.ird.govt.nz/managing-my-tax/record-keeping) covers retention, language and offshore storage approval. [Computer record keeping](https://www.ird.govt.nz/managing-my-tax/record-keeping/computer-record-keeping-for-audit) covers electronic records and accessibility. [Taxable supply information](https://www.ird.govt.nz/gst/tax-invoices-for-gst) explains the records that replaced the old tax-invoice rules. A reconciliation statement is not enough to substantiate every tax claim.

The compliance command reports missing recorded controls. It does not verify document contents, offshore-storage approval, backups, tax years, GST sufficiency or legal retention compliance. It does not delete at seven years or treat that period as permission to dispose. Retain originals and longer holds where applicable. Australian operations need their own locally reviewed retention and tax policy.

Actor labels are not identities or digital signatures. The database owner can bypass triggers. Use externally authenticated access, independent approvals, encrypted backups and an approved storage location for production. RLS and revoked public privileges block unrelated database roles, not the owner.
