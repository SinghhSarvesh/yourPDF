import fs from 'node:fs';
import {tools} from '../dist/catalog.js';
import {perform} from '../dist/pdf-core.js';
const read=p=>fs.readFileSync(`dist/${p}`,'utf8');
const write=(p,s)=>fs.writeFileSync(`dist/${p}`,s);
const guide='/guides/prepare-application-documents/';
const decisions={
 merge:['Combine complete documents','Use Merge when every page of each source belongs in the result. File order controls the output. To change individual pages afterward, use Organize PDF.','/organize-pdf/','Reorder individual pages'],
 split:['Create separate files','Choose individual-page output for one PDF per selected page, delivered in a ZIP. For one PDF containing a selection, Extract Pages is the direct route.','/extract-pages/','Keep a selection in one PDF'],
 extract:['Keep selected pages together','Enter the pages you want to keep. The result is one PDF, in the order of your selection. To create a separate file for each page, choose Split PDF.','/split-pdf/','Create individual page files'],
 remove:['Discard entire pages','Enter pages to leave out; remaining pages keep their relative order. This does not erase sensitive text from a page you retain.','/extract-pages/','Select pages to keep instead'],
 organize:['Change the reading order','Use the page arrows to move pages and deselect pages to omit them. Printed page numbers and contents references will not update automatically.','/page-numbers/','Add a new page counter'],
 rotate:['Correct sideways pages','Apply a quarter-turn to selected pages while retaining the others. This changes page orientation; it does not straighten a slightly tilted scan.','/organize-pdf/','Change page order instead'],
 numbers:['Add a simple page counter','Use for an unsigned handout with clear space at the bottom center. Existing printed numbers remain, and the cover is included in the count.','/organize-pdf/','Finalize page order first'],
 watermark:['Mark a review copy','Add a visible text label such as DRAFT. A watermark does not prevent copying and must not be used to conceal private text.','/help/','Review editing limitations'],
 optimize:['Try structural size reduction','This rewrites PDF structure without reducing scanned-image resolution. It cannot promise a target KB size; if rewriting does not help, you receive the original.','/guides/why-pdf-not-getting-smaller/','Understand PDF size limits'],
 images:['Put pictures into a PDF','Use when the recipient requests PDF rather than separate images. Each selected image becomes one page; review legibility at normal reading size.','/merge-pdf/','Combine with existing PDFs afterward'],
 jpg:['Export page pictures','Use when you need a picture of each selected PDF page. The ZIP contains JPGs, which do not retain selectable text or fillable fields.','/extract-pages/','Keep PDF pages as PDF instead']
};
for(const t of tools.filter(t=>!t.legacy)){
 const p=`${t.slug}/index.html`;let h=read(p);
 const steps=h.match(/<section class="tool-description">[\s\S]*?<ol>([\s\S]*?)<\/ol>/)?.[1]?.replace('attachment below','attachment linked above');
 if(!steps)throw Error(`Missing practice steps: ${t.slug}`);
 const [title,description,url,label]=decisions[t.id];
 h=h.replace(/<section class="tool-description">[\s\S]*?<\/section>/,`<section class="tool-description"><div><h2>${title}</h2><p>${description}</p><p><a href="${url}">${label}</a></p></div><div><h2>Check before selecting files</h2><p>${t.id==='images'?'Up to 20 JPG, PNG or WebP images and 30 MiB combined.':'Up to 30 MiB combined and 150 PDF pages. Password-protected PDFs are not supported.'} Keep your originals.</p><p><a href="/help/">All limits</a> · <a href="/download-help/">Download help</a></p></div></section>`);
 h=h.replace(/(<section data-worked-example class="prose"><h2>)[\s\S]*?(<\/h2><p>Practice input:[\s\S]*?<\/p>)/,`$1Worked example: ${t.title}$2<ol>${steps}</ol>`);
 h=h.replace(/<h2>Saving your result<\/h2>[\s\S]*?(?=<\/article>)/,'<p><a href="/download-help/">Need help saving the result?</a> · <a href="/privacy/">How local processing works</a></p>');
 write(p,h);
}
// Correct an instruction that conflicts with the resizer's validated inputs.
write('examples/index.html',read('examples/index.html').replace('leave size limits empty','set the minimum to 0 KB and maximum to 100 KB (decimal)'));
const merged=await perform('merge',[fs.readFileSync('dist/samples/merge-cover.pdf'),fs.readFileSync('dist/samples/merge-attachments.pdf')]);
write('samples/application-merged.pdf',merged.bytes);
const selected=await perform('extract',[merged.bytes],{pages:'1,3'});
write('samples/application-selected.pdf',selected.bytes);
const body=`<h1>Prepare application documents and check the result</h1>
<p>Use this workflow when a recipient asks for an ordered PDF and a separate photo or signature. First read their current instructions: some require separate files instead of a combined document. The examples below are synthetic, not official application requirements.</p>
<nav aria-label="Guide sections"><a href="#requirements">Requirements</a> · <a href="#pdf-task">PDF example</a> · <a href="#image-task">Signature example</a> · <a href="#final-check">Final checks</a></nav>
<h2 id="requirements">1. Record the receiving portal’s requirements</h2>
<ul><li>Which documents are required, and in what order?</li><li>One PDF or separate files? What is the maximum size per file?</li><li>For images: accepted format, width, height, minimum and maximum KB, and the KB convention.</li><li>Any rules for legibility, background, date, signatures or certification?</li></ul>
<p>Do not alter a digitally signed or certified document unless the recipient permits it. These PDF tools create edited copies and may lose forms, bookmarks or valid signatures.</p>
<h2 id="pdf-task">2. Practice a three-page submission</h2>
<p>Download the <a href="/samples/merge-cover.pdf" download>one-page cover</a> and <a href="/samples/merge-attachments.pdf" download>two-page attachments</a>. They contain no personal information.</p>
<ol><li>Open <a href="/merge-pdf/">Merge PDF</a> and select both samples.</li><li>Use the file arrows to put the cover first, then merge and download.</li><li>Open the downloaded file in a PDF reader. It should have three pages: the cover followed by attachments 2 and 3.</li><li>If your recipient only requested the cover and last attachment, open <a href="/extract-pages/">Extract Pages</a>, select the merged file and enter <strong>1,3</strong>. The result should have two pages.</li></ol>
<div class="table-scroll"><table><caption>Known outputs from these exact samples</caption><thead><tr><th>Operation</th><th>Expected output</th><th>Reference file</th></tr></thead><tbody><tr><td>Merge cover, then attachments</td><td>3 pages; ${merged.bytes.length.toLocaleString('en-US')} bytes in this build</td><td><a href="/samples/application-merged.pdf" download>Three-page reference</a></td></tr><tr><td>Extract 1,3 from the merged PDF</td><td>2 pages; cover then final attachment</td><td><a href="/samples/application-selected.pdf" download>Two-page reference</a></td></tr></tbody></table></div>
<p>Compare page content and order, not file hashes. Metadata can change the byte count. These references are generated using yourPDF’s processing code; they are not evidence that arbitrary documents will preserve every feature.</p>
<h3>If the PDF exceeds the recipient’s limit</h3><p>Check whether you included unnecessary documents, but remove pages only when permitted. <a href="/optimize-pdf/">Optimize PDF</a> can reduce structural overhead; it does not downsample scan images. For an image-heavy PDF, re-export from the original scanner or document application at an allowed resolution, then check legibility. Read <a href="/guides/why-pdf-not-getting-smaller/">why a PDF may not shrink</a>.</p>
<h2 id="image-task">3. Prepare a separate signature image</h2>
<p>Try the <a href="/samples/resize-practice.png" download>1,000 × 400 practice drawing</a> in <a href="/signature/">Signature resizer</a>. This is a drawing, not a real signature.</p>
<ol><li>Turn off the dimension-ratio link. Enter 300 pixels wide and 100 pixels high.</li><li>Choose Fit and PNG. Set minimum size to 0 KB and maximum to 100 KB; select 1 KB = 1,000 bytes. These are practice settings only.</li><li>Prepare the image. Fit should place a 250 × 100 drawing inside a 300 × 100 canvas, with 25 white pixels on each side.</li><li>Download it and select that saved file in <a href="/checker/">Requirement checker</a>. Enter the same requirements and inspect the drawing visually.</li></ol>
<p>Crop fills the canvas by removing content at the top and bottom for this sample. For your own signature, inspect every pen stroke. If the portal requires JPG, select JPG and check the resulting bytes again; changing the extension alone does not convert the image. See the <a href="/guides/resize-signature-pixels-and-kb/">pixels and KB guide</a>.</p>
<h2 id="final-check">4. Check the actual saved files before submitting</h2>
<ul><li>Open each saved file independently, not only its in-tool preview.</li><li>Check first and last pages, total page count, order, orientation and readable details.</li><li>Compare the file’s byte size with the portal’s convention. 100 decimal KB is 100,000 bytes; 100 binary KB is 102,400 bytes.</li><li>Keep photos and signatures separate when requested. Do not merge them into the PDF by assumption.</li><li>Use a clear filename and retain the original files until acceptance.</li></ul>
<p>A technical pass is not a guarantee of acceptance. yourPDF cannot assess identity, authenticity, required content or every portal rule. If a practice task fails, <a href="/contact/">report the tool, settings and browser</a>; do not send private documents.</p>`;
let h=read('about/index.html').replace(/<title>.*?<\/title>/,'<title>Prepare application PDFs and signature images | yourPDF</title>').replace(/<meta (name="description"|property="og:description") content="[^"]*">/g,'<meta $1 content="Practice merging application documents and sizing a signature, with downloadable reference outputs and checks before submission.">').replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="Prepare application PDFs and signature images | yourPDF">').replace(/<article class="prose">[\s\S]*?<\/article>/,`<article class="prose">${body}</article>`);
fs.mkdirSync(`dist${guide}`,{recursive:true});write(`${guide.slice(1)}index.html`,h);
for(const p of ['guides/index.html','index.html']){
 let s=read(p).replace(/<section data-application-workflow[\s\S]*?<\/section>/g,'');
 s=s.replace('</main>',`<section class="prose" data-application-workflow><h2>Prepare documents for an application</h2><p>Work through a three-page PDF and a signature image, then compare saved outputs with known results.</p><p><a href="${guide}">Follow the application-document workflow</a></p></section></main>`);write(p,s);
}
// Add the workflow inside the existing guidance region so next-tool navigation carries it too.
for(const slug of ['merge-pdf','extract-pages','images-to-pdf']){const p=`${slug}/index.html`;write(p,read(p).replace(/(<section data-worked-example[\s\S]*?)(<\/section>)/,`$1<p>Preparing an application? <a href="${guide}">Follow the full workflow and final checks</a>.</p>$2`));}
console.log('Consolidated examples and added a verified application-document workflow.');
