# Add a view

Read CLAUDE.md. Ask what decision the operator needs and identify the records supporting it. Add an additive SQL view in a new migration and a named section in views.json. Use security_invoker=true, revoke public access, and keep currencies and snapshot dates separate. Run migrations, npm test and npm run view. Inspect desktop and mobile output. Views are read-only and must not start a server or carry action buttons.
