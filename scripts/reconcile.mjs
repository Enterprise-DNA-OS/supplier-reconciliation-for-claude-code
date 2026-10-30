#!/usr/bin/env node
import {getDb} from './lib/db.mjs';
import {run,reads} from './lib/domain.mjs';
import {table} from './lib/format.mjs';
const words=[],f={};
for(const arg of process.argv.slice(2)){if(arg.startsWith('--')){const i=arg.indexOf('=');const k=arg.slice(2,i<0?undefined:i);if(k in f)throw Error(`Duplicate flag: ${k}`);f[k]=i<0?true:arg.slice(i+1);}else words.push(arg);}
const flags=['json','help','actor','dry-run','code','name','owner','due','note','evidence','out'];
for(const k of Object.keys(f))if(!flags.includes(k)){console.error(`Unknown flag: --${k}`);process.exit(1);}
const [cmd,...args]=words;
if(f.help||!cmd){console.log('Supplier reconciliation CLI\n'+Object.keys(reads).concat(['supplier <selector>','run <selector>','insights','add --code= --name= --owner= --actor=','log <supplier> --note= --due= --actor=','import ap-accurate <manifest.json> --actor= [--dry-run]','reconcile <statement> <ledger> --actor=','resolve <finding> --note= --evidence= --actor=','review <run> --evidence= --actor=','compliance','draft-supplier <supplier>','export --out=<new-file.json>']).join('\n')+'\nAll results support --json. Writes require an actor label.');process.exit(0);}
const perCommand={add:['code','name','owner','actor'],log:['note','due','actor'],import:['actor','dry-run'],reconcile:['actor'],resolve:['note','evidence','actor'],review:['evidence','actor'],export:['out']};
for(const k of Object.keys(f))if(!['json','help',...(perCommand[cmd]||[])].includes(k)){console.error(`Flag --${k} is not valid for ${cmd}`);process.exit(1);}
let db;
function display(rows){if(!Array.isArray(rows)){for(const [k,v]of Object.entries(rows)){console.log(k);display(Array.isArray(v)?v:[v]);}return;}if(!rows.length){console.log('(none)');return;}if(rows[0]?.question){for(const x of rows){console.log('\n'+x.question);display(x.rows);}return;}
const keys=Object.keys(rows[0]).filter(k=>!['raw_csv','raw','created_at','updated_at','source_sha256','label'].includes(k));
console.log(table(rows,keys.map(key=>({key,label:key.replace(/_cents$/, '').replace(/_/g,' '),format:(v)=>v==null?'unknown':key.endsWith('_cents')?(Number(v)/100).toFixed(2):typeof v==='object'?JSON.stringify(v):String(v).replace(/\s+/g,' ')}))));}

try{db=await getDb();const result=await run(db,cmd,args,f);if(f.json)console.log(JSON.stringify(result,null,2));else display(result);}catch(e){console.error(e.message);process.exitCode=1;}finally{await db?.close();}
