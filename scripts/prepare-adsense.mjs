import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function validateConfig(config) {
  const url = new URL(config.siteUrl);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('siteUrl must be an HTTPS origin.');
  if (config.publisherId !== null && !/^ca-pub-\d{16}$/.test(config.publisherId)) throw new Error('Use your real ca-pub- publisher ID with 16 digits, or null.');
  if (config.publicSupportEmail !== null && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(config.publicSupportEmail)) throw new Error('Set a valid public support email, or null.');
  if (config.enabled) throw new Error('This integration supports verification only. Ad serving requires a separate reviewed CMP, privacy and CSP integration.');
  return url.origin;
}
const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function prepare(root, config) {
  const origin = validateConfig(config);
  const pages = [];
  function walk(dir) { for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'vendor') walk(filename);
    else if (entry.name === 'index.html') pages.push(filename);
  }}
  walk(root);
  for (const filename of pages) {
    let html = fs.readFileSync(filename, 'utf8');
    const route = path.relative(root, path.dirname(filename)).split(path.sep).join('/');
    const canonical = `${origin}/${route ? route + '/' : ''}`;
    html = html.replace(/<link rel="canonical" href="[^"]*">/g, `<link rel="canonical" href="${canonical}">`)
      .replace(/<meta property="og:url" content="[^"]*">/g, `<meta property="og:url" content="${canonical}">`)
      .replace(/<meta name="google-adsense-account" content="[^"]*">/g, '');
    if (config.publisherId) html = html.replace('</head>', `<meta name="google-adsense-account" content="${config.publisherId}"></head>`);
    if (route === 'contact' && config.publicSupportEmail) {
      const email = escape(config.publicSupportEmail);
      html = html.replace(/<article class="prose">[\s\S]*?<\/article>/, `<article class="prose"><h1>Contact and support</h1><p>Email <a href="mailto:${email}">${email}</a> for tool problems, privacy questions or copyright concerns.</p><p>This opens your email app. You can also copy the address into Gmail. There is no upload form and this page does not send a message automatically.</p><h2>Report a tool problem</h2><p>Include the tool name, browser version and exact error message. Please do not send private documents, passwords or identification files. Use a synthetic sample when describing a problem.</p><h2>Security, privacy and copyright reports</h2><p>Use the same address with a clear subject. For a security issue, include the affected URL and safe steps to reproduce it; do not include other people’s data or exploit a live visitor. For a copyright concern, identify the content and your relationship to the rights holder. We do not promise a fixed response time.</p><p>Support messages are received through Gmail and used to respond to your request. For privacy information, see our <a href="/privacy/">privacy policy</a>.</p></article>`);
    }
    fs.writeFileSync(filename, html);
  }
  const adsFile = path.join(root, 'ads.txt');
  if (config.publisherId) fs.writeFileSync(adsFile, `google.com, ${config.publisherId.slice(3)}, DIRECT, f08c47fec0942fa0\n`);
  else if (fs.existsSync(adsFile)) fs.unlinkSync(adsFile);
  const routes = pages.map(f => path.relative(root, path.dirname(f)).split(path.sep).join('/'));
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.map(r => `<url><loc>${origin}/${r ? r+'/' : ''}</loc></url>`).join('') + '</urlset>');
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /qa.html\nSitemap: ${origin}/sitemap.xml\n`);
  fs.mkdirSync(path.join(root, '.well-known'), {recursive:true});
  if (config.publicSupportEmail) fs.writeFileSync(path.join(root, '.well-known/security.txt'), `Contact: mailto:${config.publicSupportEmail}\nExpires: 2027-04-20T00:00:00Z\nPreferred-Languages: en\nCanonical: ${origin}/.well-known/security.txt\n`);
  return {pages:pages.length, verificationConfigured:!!config.publisherId, supportConfigured:!!config.publicSupportEmail, adsEnabled:false};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(prepare('dist', JSON.parse(fs.readFileSync('monetization.config.json', 'utf8'))));
}
