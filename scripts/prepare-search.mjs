import fs from 'node:fs';
import {searchContent} from '../dist/search-content.js';
const config=JSON.parse(fs.readFileSync('monetization.config.json','utf8'));
const token=config.searchConsoleVerification;
if(token && !/^[A-Za-z0-9_-]{20,200}$/.test(token)) throw Error('Invalid Google Search Console verification token.');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const [slug,[title,description,related]] of Object.entries(searchContent)){
 const file=`dist/${slug}/index.html`;let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(description)}">`)
  .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${escape(title)}">`)
  .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${escape(description)}">`)
  .replace(/<nav data-related-tools[\s\S]*?<\/nav>/g,'');
 const links=related.map(id=>`<li><a href="/${id}/">${escape(searchContent[id][0].split(' | ')[0])}</a></li>`).join('');
 html=html.replace('</main>',`<nav data-related-tools class="prose" aria-label="Related tools"><h2>Related document tools</h2><ul>${links}</ul></nav></main>`);
 fs.writeFileSync(file,html);
}
// Ownership verification is supplied by the owner, never invented.
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const path=dir+'/'+item.name;
 if(item.isDirectory() && item.name!=='vendor')walk(path);
 else if(item.name==='index.html'){
  let html=fs.readFileSync(path,'utf8').replace(/<meta name="google-site-verification" content="[^"]*">/g,'');
  if(token)html=html.replace('</head>',`<meta name="google-site-verification" content="${token}"></head>`);
  fs.writeFileSync(path,html);
 }
}}
walk('dist');
console.log('Updated search metadata and related links for 14 tool pages.');
