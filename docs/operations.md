# Operations

Use Node 22 or later. Run npm ci, npm run migrate, then import business sources. npm run demo seeds synthetic data and belongs only in a separate demonstration database.

PGlite lives at DATA_DIR or .data/db. Stop every process before copying that directory as a native backup. Test recovery into a separate directory. For PostgreSQL use a restricted private server and its native backup/restore tools, such as pg_dump and pg_restore. DATABASE_URL must never be committed. Use PostgreSQL 15 or later. Remote TLS is verified by default.

Export produces a portable JSON evidence archive. It includes sources and all domain rows but is not an automatic restore format. Preserve originals and referenced evidence files separately. Generated reports, source files and archives can contain private business data. Keep them in the ignored imports, exports, drafts and docs-out locations with encrypted storage and controlled access.

One database serves one business. All CLI operations use the trusted database owner's connection. The base has no user login, MFA, tenant routing or verified signature service. RLS denies unprivileged roles unless separately configured. For multi-user operation add verified identity, least-privilege access and approval gates before loading real records.

Batch and line records are immutable. Revision means a new source key and a new run. Do not edit historical migrations. Default exception views include all open runs, so finish or explain superseded reviews explicitly and state which cutoff is being used. The source key and cutoff, not the import timestamp, identify the business period.

Supplier notes are append-only follow-up records, not a task completion system. Add a completion note with the original reference to retain history. No scheduler, sender, payment tool, tax filing or accounting posting is installed.
