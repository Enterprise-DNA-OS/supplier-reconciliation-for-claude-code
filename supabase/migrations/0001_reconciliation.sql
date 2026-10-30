create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create function immutable_record() returns trigger language plpgsql as $$ begin raise exception 'Evidence is immutable; append a new record'; end $$;
create table suppliers (
 id uuid primary key default gen_random_uuid(), code text not null unique check(code<>''), name text not null check(name<>''),
 owner text not null default 'Unassigned', active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index supplier_code_ci on suppliers(lower(code));
create table batches (
 id uuid primary key default gen_random_uuid(), supplier_id uuid not null references suppliers,
 kind text not null check(kind in ('statement','ledger')), source_key text not null check(source_key<>''),
 as_of date not null, currency text not null check(currency ~ '^[A-Z]{3}$'),
 declared_cents bigint, source_name text not null, source_sha256 text not null,
 raw_csv text not null, actor text not null check(actor<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(supplier_id,kind,source_key)
);
create table entries (
 id uuid primary key default gen_random_uuid(), batch_id uuid not null references batches,
 row_number integer not null check(row_number>0), source_id text not null,
 reference text not null check(reference<>''), norm_ref text not null check(norm_ref<>''),
 document_date date not null, due_date date, amount_cents bigint not null,
 raw jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(batch_id,row_number), unique(batch_id,source_id)
);
create table runs (
 id uuid primary key default gen_random_uuid(), statement_id uuid not null references batches,
 ledger_id uuid not null references batches, actor text not null check(actor<>''),
 status text not null default 'open' check(status in ('open','reviewed')),
 reviewer text, reviewed_at timestamptz, review_evidence text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(statement_id<>ledger_id),
 check(status='open' or (reviewer is not null and reviewer<>actor and reviewed_at is not null and length(review_evidence)>0))
);
create table findings (
 id uuid primary key default gen_random_uuid(), run_id uuid not null references runs,
 statement_entry uuid references entries, ledger_entry uuid references entries,
 reference text not null, outcome text not null check(outcome in ('matched','amount-difference','missing-ledger','missing-statement','ambiguous','near-match')),
 statement_cents bigint, ledger_cents bigint, detail text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(statement_entry is not null or ledger_entry is not null)
);
create table resolutions (
 id uuid primary key default gen_random_uuid(), finding_id uuid not null unique references findings,
 actor text not null check(actor<>''), note text not null check(note<>''), evidence text not null check(evidence<>''),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notes (
 id uuid primary key default gen_random_uuid(), supplier_id uuid not null references suppliers,
 actor text not null check(actor<>''), note text not null check(note<>''), due_date date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table events (
 id uuid primary key default gen_random_uuid(), actor text not null check(actor<>''), action text not null, record_id uuid not null,
 detail jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['suppliers','batches','entries','runs','findings','resolutions','notes','events'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',t);
 end loop;
 foreach t in array array['batches','entries','findings','resolutions','notes','events'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function immutable_record()',t);
 end loop;
end $$;
create view v_batches with (security_invoker=true) as
 select b.id,s.code supplier,s.name,b.kind,b.source_key,b.as_of,b.currency,b.declared_cents,
 count(e.id)::int lines,coalesce(sum(e.amount_cents),0)::bigint total_cents,b.created_at
 from batches b join suppliers s on s.id=b.supplier_id left join entries e on e.batch_id=b.id group by b.id,s.code,s.name;
create view v_runs with (security_invoker=true) as
 select r.id,s.code supplier,b.as_of,b.currency,r.status,r.actor,r.reviewer,
 count(f.id)::int lines,count(f.id) filter(where f.outcome='matched')::int matched,
 count(f.id) filter(where f.outcome<>'matched')::int exceptions,
 count(f.id) filter(where f.outcome<>'matched' and x.id is null)::int unresolved,
 r.created_at,r.updated_at
 from runs r join batches b on b.id=r.statement_id join suppliers s on s.id=b.supplier_id
 left join findings f on f.run_id=r.id left join resolutions x on x.finding_id=f.id group by r.id,s.code,b.as_of,b.currency;
create view v_attention with (security_invoker=true) as
 select f.id,r.id run_id,s.code supplier,b.as_of,b.currency,f.reference,f.outcome,f.statement_cents,f.ledger_cents,
 current_date-b.as_of age_days,case when x.id is null then 'needs-review' else 'explained' end review_state,f.detail
 from findings f join runs r on r.id=f.run_id join batches b on b.id=r.statement_id
 join suppliers s on s.id=b.supplier_id left join resolutions x on x.finding_id=f.id
 where f.outcome<>'matched' and r.status='open';
revoke all on v_batches,v_runs,v_attention from public;
