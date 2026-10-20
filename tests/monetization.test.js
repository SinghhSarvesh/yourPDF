import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {prepare, validateConfig} from '../scripts/prepare-adsense.mjs';
const config = {siteUrl:'https://example.test', publisherId:null, publicSupportEmail:null, enabled:false};
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yourpdf-monetization-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'contact'));
 const html='<head><link rel="canonical" href="https://old.test/"><meta property="og:url" content="https://old.test/"></head><article class="prose">Contact</article>';
 fs.writeFileSync(path.join(root,'index.html'),html);
 fs.writeFileSync(path.join(root,'contact/index.html'),html);
 return root;
}
test('default build never publishes an invented publisher or active advertising', t=>{
 const root=fixture(t);prepare(root,config);
 assert.equal(fs.existsSync(path.join(root,'ads.txt')),false);
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.doesNotMatch(html,/google-adsense-account|adsbygoogle|<script/);
 assert.match(html,/https:\/\/example.test\//);
 assert.match(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8'),/https:\/\/example.test\/contact\//);
});
test('verification is repeatable, creates seller entry, and can be removed without ad requests',t=>{
 const root=fixture(t);
 const enabledVerification={...config,publisherId:'ca-pub-1234567890123456',publicSupportEmail:'support@example.test'};
 prepare(root,enabledVerification);const first=fs.readFileSync(path.join(root,'index.html'),'utf8');
 prepare(root,enabledVerification);assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8'),first);
 assert.equal((first.match(/google-adsense-account/g)||[]).length,1);
 assert.doesNotMatch(first,/<script/);
 assert.equal(fs.readFileSync(path.join(root,'ads.txt'),'utf8'),'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
 assert.match(fs.readFileSync(path.join(root,'contact/index.html'),'utf8'),/mailto:support@example.test/);
 prepare(root,config);assert.equal(fs.existsSync(path.join(root,'ads.txt')),false);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'index.html'),'utf8'),/google-adsense-account/);
});
test('rejects malformed owner data and unsupported ad activation',()=>{
 for(const changes of [{publisherId:'ca-pub-not-real'},{publicSupportEmail:'x"><script>@example.test'},{siteUrl:'http://example.test'},{siteUrl:'https://example.test/path'},{enabled:true}]) assert.throws(()=>validateConfig({...config,...changes}));
});
