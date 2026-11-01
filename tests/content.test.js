import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {PDFDocument} from '../dist/vendor/pdf-lib.js';
const root=path.resolve('dist');
const pages=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()&&e.name!=='vendor')walk(p);else if(e.name==='index.html')pages.push(p);}}walk(root);
test('published pages have reachable local links, one canonical and unique IDs',()=>{
 for(const p of pages){const html=fs.readFileSync(p,'utf8');assert.equal((html.match(/rel="canonical"/g)||[]).length,1,p);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`Duplicate IDs: ${p}`);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)){if(!url.startsWith('/')||url.startsWith('//'))continue;let target=path.join(root,url.split(/[?#]/)[0]);if(url.split(/[?#]/)[0].endsWith('/'))target=path.join(target,'index.html');assert.ok(fs.existsSync(target),`${p}: missing ${url}`);}
 assert.ok(!html.includes('PDF tools and verified application presets are planned'),p);
 }
});
test('practice outputs match the documented page counts and rotation',async()=>{
 for(const [name,count] of [['page-practice',4],['extract-result',2],['remove-result',3],['organize-result',4],['rotate-result',4],['structure-before',4],['structure-after',4]]){
 const d=await PDFDocument.load(fs.readFileSync(`dist/samples/${name}.pdf`));assert.equal(d.getPageCount(),count,name);
 if(name==='rotate-result')assert.deepEqual(d.getPages().map(p=>p.getRotation().angle),[0,0,90,0]);
 }
 assert.ok(fs.statSync('dist/samples/structure-after.pdf').size<=fs.statSync('dist/samples/structure-before.pdf').size);
});
