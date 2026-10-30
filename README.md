# Supplier Reconciliation for Claude Code

Your supplier statements, ledger snapshots and discrepancy reviews in one database you own. Free and open source, MIT. Created by Enterprise DNA. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Install the free version and run your own desk. | Your supplier formats, matching rules, fields and records brought across. | Installed, connected and operated inside Omni by Enterprise DNA. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=ap-accurate&utm_medium=readme) | [Setup fee, then retainer](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=ap-accurate&utm_medium=readme) |

## What it does

Match a supplier's open-item statement to an accounting ledger snapshot at the same date. Find missing credits, amount differences, repeated references and items that occur on only one side. Preserve the source CSVs, record explanations with evidence references, and assemble a review pack. It works for wholesalers, manufacturers and finance teams handling supplier discrepancies.

AP Accurate publishes an indicative US$300 to US$5,000 monthly range for statement reconciliation, volume and configuration dependent. Twelve times the upper figure is US$60,000 before rebates. This is vendor list-price context, not a verified customer invoice or a savings promise. [Pricing checked 30 October 2026](https://360-ap.com/pricing).

This base operates the reconciliation records desk. PDF extraction, scheduled ledger feeds, supplier portals and outbound chasing are custom installation work. It does not execute payments, post journals or replace an accounting ledger. [Scope](docs/why-no-front-end.md).

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/supplier-reconciliation-for-claude-code.git
cd supplier-reconciliation-for-claude-code
npm install
npm test
npm run demo
node scripts/reconcile.mjs exceptions
npm run view
npm run docs
```

Open the folder in your coding agent and ask for `/weekly-review`. The demo is synthetic. Its September 2026 snapshots deliberately contain a missing credit, two duplicate lines, a reference variation and an amount difference. The seed is idempotent. Do not seed a business database.

For private PostgreSQL, set DATABASE_URL in your own environment and run `npm run migrate`. Leave DATABASE_URL unset for PGlite. Node 22 or later is recommended. PostgreSQL 15 or later is needed for invoker-security views. See [operations](docs/operations.md).

## The weekly rituals

- `/supplier-chase`: find missing or stale statements before month-end.
- `/credit-chase`: find credits present on only one side.
- `/duplicates`: identify repeated source references before matching.
- `/reconcile`: compare one statement with its dated ledger snapshot.
- `/weekly-review`: prepare Monday's statement, discrepancy and follow-up review.
- `/compliance`: flag missing control totals, unassigned owners and unresolved records.

There are 31 workflow commands. [CLI reference](docs/cli.md) lists the operations. Every read has human output and --json. Names are case-insensitive, IDs can be shortened when unique, and ambiguous matches list candidates and exit with status 1.

## Bring your AP Accurate source records

Reuse the supplier CSVs and accounting open-item extracts that feed reconciliation. AP Accurate documents CSV input but does not publish a proprietary export schema. We do not claim a direct import of its match history, approvals or attachments. Ask the vendor for those records and map them separately if required.

Prepare one manifest pointing to a statement CSV and a ledger CSV with the same supplier, currency and cutoff. Map your headings once. Then:

```bash
node scripts/reconcile.mjs import ap-accurate examples/manifest.json --actor="Operator" --dry-run
node scripts/reconcile.mjs import ap-accurate examples/manifest.json --actor="Operator"
node scripts/reconcile.mjs reconcile DEMO-ST-2026-09 DEMO-GL-2026-09 --actor="Operator"
```

The demo supplier exists after seeding. Create your actual supplier with `/add` in an empty business database. [Switching guide](docs/replace-ap-accurate.md) covers source scope, signed amounts and reconciliation checks. Importing a prepared pair is one command. Full history migration and production acceptance are separate work.

## Review controls

Matching uses exact references without case sensitivity, within one supplier, currency and cutoff. Punctuation variations remain suggestions. Duplicates do not match automatically. Every source line appears exactly once on its own side in the reconciliation. Negative amounts represent credits.

Explaining an exception records a note and evidence reference. It does not erase the discrepancy. Completing the review requires every exception to have an explanation and a reviewer different from the run and exception preparers. Recorded actor labels are not authenticated identity. The database owner can bypass application controls. Install external access controls for shared business use.

## Your documents and views

`npm run docs` renders a reconciliation review pack for each run and supplier follow-up worksheets. `npm run view` renders weekly exceptions and source totals. Change business name, colours and logo in brand.json. Documents are escaped HTML, local and read-only. They are not payment instructions, taxable supply documents or audit opinions.

## Ten questions answered from your records

`/insights` answers these today. They demonstrate custom analysis of the records, not a claim that AP Accurate cannot build an equivalent report.

1. Which missing credits are still unexplained?
2. Which suppliers have old exceptions and no assigned owner?
3. Which statement lines have amount differences by currency?
4. Which references occur more than once in a source?
5. Which suppliers have no recent statement?
6. Which ledger entries are absent from the supplier statement?
7. Which reference variations need a human check?
8. Which unresolved exceptions are older than a month?
9. Which completed reviews retain explained discrepancies?
10. Which suppliers have overdue follow-ups and open exceptions?

## Your first hour: ten things to ask for

1. Show the statement and ledger control totals.
2. Find the missing credit note.
3. Explain which reference variation needs review.
4. List duplicate references without merging them.
5. Tell me which suppliers have no statement.
6. Draft a supplier discrepancy note locally.
7. Record an evidence-backed explanation for one discrepancy.
8. Put our business name on the review pack.
9. Add our purchasing division through `/customise`.
10. Build a view of unresolved credits through `/new-view`.

## Verification and operating limits

`npm test` exercises migration and seed repeatability, exact and ambiguous matching, signed credits, balance checks, import rollback, evidence review, restricted-role access, every read command, drafts, archives and HTML escaping. The CI workflow runs Windows and Linux. Local evidence and hosted results are recorded in [verification](docs/verification.md).

[Compliance checks](docs/compliance.md) are limited record checks. They do not certify legal compliance, determine GST treatment or validate that an evidence file is genuine. Keep original documents and use an accountant for tax decisions.

[MIT licence](LICENSE). Independent project, not affiliated with or endorsed by AP Accurate or 360° AP.
