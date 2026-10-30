import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {parseCsv,pick} from './csv.mjs';
import {REPO_ROOT} from './db.mjs';
export const today=()=>new Date().toISOString().slice(0,10);
export function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||'')||!Number.isFinite(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)throw Error(`Invalid ISO date: ${v}`);return v;}
export function cents(v){if(!/^-?\d+(\.\d{1,2})?$/.test(String(v)))throw Error(`Invalid signed amount: ${v}; use decimal units, no separators`);const [a,b='']=String(v).replace('-','').split('.');const n=BigInt(a)*100n+BigInt(b.padEnd(2,'0'));if(n>9007199254740991n)throw Error('Amount exceeds safe range');return String(v).startsWith('-')?-Number(n):Number(n);}
const required=(v,key)=>{if(typeof v!=='string'||!v.trim())throw Error(`Required: ${key}`);return v.trim();};
const actor=f=>required(f.actor,'--actor');
const norm=s=>s.toUpperCase().replace(/[^A-Z0-9]/g,'');
const allowed=(obj,keys)=>{for(const k of Object.keys(obj))if(!keys.includes(k))throw Error(`Unknown field: ${k}`);};
async function transaction(db,fn,dry=false){await db.exec('BEGIN');try{const result=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function event(db,a,action,id,detail){await db.query('insert into events(actor,action,record_id,detail) values($1,$2,$3,$4)',[a,action,id,JSON.stringify(detail)]);}
export async function resolve(db,table,query){
 if(!['suppliers','batches','runs','findings'].includes(table))throw Error('Unsupported record kind');
 const q=required(query,'record selector');
 const label=table==='suppliers'?"code || ' ' || name":table==='batches'?"kind || ' ' || source_key":table==='findings'?"reference || ' ' || outcome":"status";
 let rows=await db.query(`select *, ${label} label from ${table} where lower(id::text)=lower($1)${table==='suppliers'?' or lower(code)=lower($1) or lower(name)=lower($1)':''}${table==='batches'?' or lower(source_key)=lower($1)':''}`,[q]);
 if(!rows.length)rows=await db.query(`select *, ${label} label from ${table} where position(lower($1) in lower(id::text))=1 or position(lower($1) in lower(${label}))>0 order by id`,[q]);
 if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'No'} ${table} match for ${q}\n${rows.map(x=>`${x.id} ${x.label}`).join('\n')}`);
 return rows[0];
}
export const reads={
 exceptions:'select supplier,currency,reference,outcome,review_state from v_attention order by supplier,reference,outcome',
 balances:'select supplier,kind,as_of,currency,total_cents,declared_cents from v_batches order by supplier,kind',
 suppliers:'select id,code,name,owner,active from suppliers order by code',
 statements:"select * from v_batches where kind='statement' order by as_of desc,supplier",
 ledger:"select * from v_batches where kind='ledger' order by as_of desc,supplier",
 runs:'select * from v_runs order by created_at desc',
 attention:'select * from v_attention order by age_days desc,supplier,reference',
 'credit-chase':"select * from v_attention where statement_cents<0 or ledger_cents<0 order by supplier,reference",
 'month-end':'select * from v_runs order by as_of,supplier,currency',
 'supplier-chase':"select s.code,s.name,s.owner,max(b.as_of) latest_statement,current_date-max(b.as_of) days_since_statement from suppliers s left join batches b on b.supplier_id=s.id and b.kind='statement' where s.active group by s.id having max(b.as_of) is null or max(b.as_of)<current_date-31 order by s.code",
 duplicates:"select b.id batch_id,s.code supplier,b.kind,b.currency,e.norm_ref,count(*)::int occurrences from entries e join batches b on b.id=e.batch_id join suppliers s on s.id=b.supplier_id group by b.id,s.code,e.norm_ref having count(*)>1 order by s.code,e.norm_ref",
 'follow-ups':'select n.id,s.code supplier,n.actor,n.note,n.due_date from notes n join suppliers s on s.id=n.supplier_id where n.due_date is not null order by n.due_date,s.code',
 history:'select * from events order by created_at,id',
};
export const insightSpecs=[
 ['Which missing credits are still unexplained?',"select * from v_attention where statement_cents<0 and review_state='needs-review'"],
 ['Which suppliers have old exceptions and no assigned owner?',"select a.supplier,a.reference,a.age_days,s.owner from v_attention a join suppliers s on s.code=a.supplier where a.age_days>30 and s.owner='Unassigned'"],
 ['Which statement lines have amount differences by currency?',"select supplier,currency,reference,statement_cents,ledger_cents from v_attention where outcome='amount-difference'"],
 ['Which references occur more than once in a source?',reads.duplicates],
 ['Which suppliers have no recent statement?',reads['supplier-chase']],
 ['Which ledger entries are absent from the supplier statement?',"select supplier,currency,reference,ledger_cents from v_attention where outcome='missing-statement'"],
 ['Which reference variations need a human check?',"select supplier,reference,detail from v_attention where outcome='near-match'"],
 ['Which unresolved exceptions are older than a month?',"select supplier,reference,outcome,age_days from v_attention where age_days>30 and review_state='needs-review'"],
 ['Which completed reviews retain explained discrepancies?',"select supplier,as_of,currency,exceptions,reviewer from v_runs where status='reviewed' and exceptions>0"],
 ['Which suppliers have overdue follow-ups and open exceptions?',"select distinct s.code supplier,n.note,n.due_date from suppliers s join notes n on n.supplier_id=s.id join v_attention a on a.supplier=s.code where n.due_date<current_date order by s.code"],
];
export async function importManifest(db,file,f){
 const manifest=JSON.parse(readFileSync(file,'utf8'));allowed(manifest,['supplier','statement','ledger']);
 const s=await resolve(db,'suppliers',manifest.supplier);const a=actor(f);const base=path.dirname(path.resolve(file));
 const specs=[];
 for(const kind of ['statement','ledger']){
  const m=manifest[kind];if(!m)throw Error(`Missing ${kind} descriptor`);
  allowed(m,['file','key','as_of','currency','balance','map']);
  date(m.as_of);if(!['NZD','AUD','USD','GBP','EUR'].includes(m.currency))throw Error('Supported currencies: NZD, AUD, USD, GBP, EUR');
  required(m.key,'batch key');const input=readFileSync(path.resolve(base,required(m.file,'CSV file')),'utf8');const rows=parseCsv(input);
  if(!rows.length)throw Error(`${kind}: empty source`);
  const columns=m.map||{};allowed(columns,['source_id','reference','document_date','due_date','amount']);
  const get=(r,k,aliases)=>columns[k]?pick(r,columns[k]):pick(r,...aliases);
  const seen=new Set();let total=0;
  const entries=rows.map((r,i)=>{
   const source_id=required(get(r,'source_id',['Source ID','ID'])||String(i+1),'source id');if(seen.has(source_id))throw Error('Duplicate source ID');seen.add(source_id);
   const reference=required(get(r,'reference',['Document Number','Invoice Number','Reference']),'Document Number');if(!norm(reference))throw Error('Reference needs a letter or number');
   const document_date=date(get(r,'document_date',['Document Date','Invoice Date']));if(document_date>m.as_of)throw Error('Document date is after snapshot cutoff');
   const due=get(r,'due_date',['Due Date']);if(due)date(due);
   const amount_cents=cents(get(r,'amount',['Document Amount','Amount','Open Amount']));total+=amount_cents;if(!Number.isSafeInteger(total))throw Error('Batch total exceeds safe range');
   return {source_id,reference,norm_ref:norm(reference),document_date,due_date:due||null,amount_cents,row_number:i+1,raw:r};
  });
  const declared=m.balance===undefined?null:cents(String(m.balance));if(declared!==null&&declared!==total)throw Error(`${kind}: declared balance does not match line sum`);
  // Identity includes cutoff, currency, column mapping and source text. File name is descriptive only.
  const sha=createHash('sha256').update(JSON.stringify({input,as_of:m.as_of,currency:m.currency,map:columns,declared})).digest('hex');
  specs.push({kind,m,input,entries,declared,sha,total});
 }
 if(specs[0].m.as_of!==specs[1].m.as_of||specs[0].m.currency!==specs[1].m.currency)throw Error('Statement and ledger must have the same cutoff and currency');
 return transaction(db,async()=>{
  const result=[];
  for(const x of specs){
   const old=await db.query('select * from batches where supplier_id=$1 and kind=$2 and source_key=$3',[s.id,x.kind,x.m.key]);
   if(old.length){if(old[0].source_sha256!==x.sha)throw Error(`Conflicting batch ${x.m.key}; use a new key for a revised snapshot`);result.push({kind:x.kind,id:old[0].id,action:'skipped',lines:x.entries.length,total_cents:x.total});continue;}
   const [b]=await db.query('insert into batches(supplier_id,kind,source_key,as_of,currency,declared_cents,source_name,source_sha256,raw_csv,actor) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id',[s.id,x.kind,x.m.key,x.m.as_of,x.m.currency,x.declared,path.basename(x.m.file),x.sha,x.input,a]);
   for(const e of x.entries)await db.query('insert into entries(batch_id,row_number,source_id,reference,norm_ref,document_date,due_date,amount_cents,raw) values($1,$2,$3,$4,$5,$6,$7,$8,$9)',[b.id,e.row_number,e.source_id,e.reference,e.norm_ref,e.document_date,e.due_date,e.amount_cents,JSON.stringify(e.raw)]);
   await event(db,a,'import',b.id,{kind:x.kind,key:x.m.key,lines:x.entries.length,source_sha256:x.sha});
   result.push({kind:x.kind,id:b.id,action:f['dry-run']?'would-import':'imported',lines:x.entries.length,total_cents:x.total});
  }return result;
 },Boolean(f['dry-run']));
}
export async function reconcile(db,statement,ledger,f){
 const s=await resolve(db,'batches',statement),l=await resolve(db,'batches',ledger),a=actor(f);
 if(s.kind!=='statement'||l.kind!=='ledger')throw Error('Choose a statement followed by a ledger snapshot');
 if(s.supplier_id!==l.supplier_id||s.currency!==l.currency||s.as_of!==l.as_of)throw Error('Supplier, currency and cutoff must match');
 return transaction(db,async()=>{
  const [run]=await db.query('insert into runs(statement_id,ledger_id,actor) values($1,$2,$3) returning id',[s.id,l.id,a]);
  const left=await db.query('select * from entries where batch_id=$1 order by row_number',[s.id]),right=await db.query('select * from entries where batch_id=$1 order by row_number',[l.id]);
  const used=new Set();
  const add=async(x,y,outcome,detail)=>db.query('insert into findings(run_id,statement_entry,ledger_entry,reference,outcome,statement_cents,ledger_cents,detail) values($1,$2,$3,$4,$5,$6,$7,$8)',[run.id,x?.id||null,y?.id||null,x?.reference||y.reference,outcome,x?.amount_cents??null,y?.amount_cents??null,detail]);
  for(const x of left){
   const exact=right.filter(y=>y.reference.toUpperCase()===x.reference.toUpperCase());
   const dup=left.filter(y=>y.norm_ref===x.norm_ref).length>1||right.filter(y=>y.norm_ref===x.norm_ref).length>1;
   if(dup){await add(x,null,'ambiguous','Repeated normalised reference. Every candidate remains unmatched.');continue;}
   if(exact.length===1&&!used.has(exact[0].id)){
    const y=exact[0];used.add(y.id);await add(x,y,String(x.amount_cents)===String(y.amount_cents)?'matched':'amount-difference','Exact reference, same supplier, currency and cutoff.');
   }else{
    const near=right.filter(y=>y.norm_ref===x.norm_ref);
    await add(x,null,near.length?'near-match':'missing-ledger',near.length?`Possible reference variation: ${near.map(y=>y.reference).join(', ')}. Not auto-matched.`:'No exact ledger reference in this snapshot.');
   }
  }
  for(const y of right)if(!used.has(y.id))await add(null,y,'missing-statement','Ledger entry not consumed by an exact one-to-one match.');
  await event(db,a,'reconcile',run.id,{statement:s.id,ledger:l.id});
  return db.query('select * from v_runs where id=$1',[run.id]);
 });
}
export async function run(db,command,args=[],f={}){
 if(reads[command])return db.query(reads[command]);
 if(command==='insights'){const out=[];for(const [question,sql]of insightSpecs)out.push({question,rows:await db.query(sql)});return out;}
 if(command==='supplier'){const s=await resolve(db,'suppliers',args[0]);return {supplier:s,batches:await db.query('select * from v_batches where supplier=$1 order by as_of',[s.code]),notes:await db.query('select * from notes where supplier_id=$1 order by created_at',[s.id])};}
 if(command==='run'){const r=await resolve(db,'runs',args[0]);return {run:(await db.query('select * from v_runs where id=$1',[r.id]))[0],findings:await db.query('select f.*,x.note resolution,x.evidence from findings f left join resolutions x on x.finding_id=f.id where f.run_id=$1 order by f.reference,f.outcome',[r.id])};}
 if(command==='add')return transaction(db,async()=>{const a=actor(f);const code=required(f.code,'--code');if(!/^[A-Za-z0-9_-]+$/.test(code))throw Error('Code uses letters, numbers, underscore or hyphen');const [s]=await db.query('insert into suppliers(code,name,owner) values($1,$2,$3) returning *',[code,required(f.name,'--name'),f.owner||'Unassigned']);await event(db,a,'add-supplier',s.id,{code});return [s];});
 if(command==='log')return transaction(db,async()=>{const a=actor(f),s=await resolve(db,'suppliers',args[0]);if(f.due)date(f.due);const [n]=await db.query('insert into notes(supplier_id,actor,note,due_date) values($1,$2,$3,$4) returning *',[s.id,a,required(f.note,'--note'),f.due||null]);await event(db,a,'log',n.id,{supplier:s.id});return [n];});
 if(command==='import'){if(args[0]!=='ap-accurate')throw Error('Use import ap-accurate <manifest.json>');return importManifest(db,required(args[1],'manifest file'),f);}
 if(command==='reconcile')return reconcile(db,args[0],args[1],f);
 if(command==='resolve')return transaction(db,async()=>{const a=actor(f),x=await resolve(db,'findings',args[0]);const [r]=await db.query('select * from runs where id=$1 for update',[x.run_id]);if(r.status!=='open'||x.outcome==='matched')throw Error('Only open exceptions can be explained');const [v]=await db.query('insert into resolutions(finding_id,actor,note,evidence) values($1,$2,$3,$4) returning *',[x.id,a,required(f.note,'--note'),required(f.evidence,'--evidence')]);await event(db,a,'explain-exception',v.id,{finding:x.id});return [v];});
 if(command==='review')return transaction(db,async()=>{const a=actor(f),selected=await resolve(db,'runs',args[0]);const [r]=await db.query('select * from runs where id=$1 for update',[selected.id]);if(r.status!=='open'||r.actor.toLowerCase()===a.toLowerCase())throw Error('Review needs an open run and a different reviewer');const unresolved=await db.query("select f.id from findings f left join resolutions x on x.finding_id=f.id where f.run_id=$1 and f.outcome<>'matched' and x.id is null",[r.id]);if(unresolved.length)throw Error(`${unresolved.length} unexplained exceptions`);const self=await db.query('select x.id from resolutions x join findings f on f.id=x.finding_id where f.run_id=$1 and lower(x.actor)=lower($2)',[r.id,a]);if(self.length)throw Error('Reviewer must differ from exception preparers');await db.query("update runs set status='reviewed',reviewer=$2,reviewed_at=now(),review_evidence=$3 where id=$1",[r.id,a,required(f.evidence,'--evidence')]);await event(db,a,'review',r.id,{evidence:f.evidence});return db.query('select * from v_runs where id=$1',[r.id]);});
 if(command==='compliance'){
  return db.query(`select 'SOURCE-BALANCE' rule,supplier,source_key reference,'Source balance was not supplied' issue from v_batches where declared_cents is null
   union all select 'OWNER',code,code,'Assign an accountable reviewer' from suppliers where active and owner='Unassigned'
   union all select 'UNRESOLVED',supplier,reference,'Retain source evidence and explain this discrepancy' from v_attention where review_state='needs-review'
   union all select 'STALE-SOURCE',supplier,source_key,'Snapshot is over 31 days old; obtain current records before decisions' from v_batches where as_of<current_date-31
   order by rule,supplier,reference`);
 }
 if(command==='draft-supplier'){
  const s=await resolve(db,'suppliers',args[0]);const rows=await db.query('select * from v_attention where supplier=$1 order by reference',[s.code]);const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,`supplier-${s.id}-${randomUUID()}.md`);writeFileSync(file,`# DRAFT for review: ${s.name}\n\nThe following statement items need checking against the source documents. These are observations from dated snapshots, not a payment instruction.\n\n`+rows.map(r=>`- ${r.reference}: ${r.outcome}, ${r.currency}, statement ${r.statement_cents??'unknown'} cents, ledger ${r.ledger_cents??'unknown'} cents, as of ${r.as_of}.`).join('\n')+'\n',{mode:0o600});return [{file,items:rows.length}];
 }
 if(command==='export'){
  const out={format:'supplier-reconciliation-v1',exported_at:new Date().toISOString(),tables:{}};await db.exec('BEGIN READ ONLY');try{for(const t of ['suppliers','batches','entries','runs','findings','resolutions','notes','events','schema_migrations'])out.tables[t]=await db.query(`select * from ${t}`);}finally{await db.exec('ROLLBACK');}const file=path.resolve(required(f.out,'--out'));writeFileSync(file,JSON.stringify(out,null,2)+'\n',{flag:'wx',mode:0o600});return [{file,records:Object.values(out.tables).reduce((n,r)=>n+r.length,0)}];
 }
 throw Error(`Unknown command: ${command}`);
}
