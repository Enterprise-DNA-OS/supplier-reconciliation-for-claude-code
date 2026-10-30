import {readFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {importManifest,reconcile} from './lib/domain.mjs';
export async function seed(db){
 await db.exec(readFileSync(path.join(REPO_ROOT,'supabase/seed.sql'),'utf8'));
 await importManifest(db,path.join(REPO_ROOT,'examples/manifest.json'),{actor:'Demo operator'});
 const [s]=await db.query("select id from batches where source_key='DEMO-ST-2026-09'");
 if(!(await db.query('select id from runs where statement_id=$1',[s.id])).length)await reconcile(db,'DEMO-ST-2026-09','DEMO-GL-2026-09',{actor:'Demo operator'});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const db=await getDb();try{await seed(db);console.log('Seeded synthetic supplier records, stale snapshots and overdue follow-ups');}finally{await db.close();}}
