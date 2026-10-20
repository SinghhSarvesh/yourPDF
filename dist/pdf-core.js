import {PDFDocument, StandardFonts, degrees, rgb} from './vendor/pdf-lib.js';
export const MAX_BYTES=30*1024*1024,MAX_PAGES=150,MAX_FILES=20;
export function validateFiles(files){if(!files.length)throw Error('Choose a file first.');if(files.length>MAX_FILES)throw Error('Choose up to 20 files per task.');if(files.reduce((n,f)=>n+f.size,0)>MAX_BYTES)throw Error('This task exceeds the 30 MiB combined file limit. Try fewer or smaller files.');}
export function parsePages(text,count){
 if(!text.trim())return Array.from({length:count},(_,i)=>i);
 const out=[];for(const part of text.split(',')){const m=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!m)throw Error('Use page numbers like 1, 3-5, 8.');const a=Number(m[1]),b=m[2]?Number(m[2]):a;if(a<1||b<1||a>count||b>count)throw Error(`Choose pages between 1 and ${count}.`);if(b<a)throw Error('Page ranges must go forwards, for example 2-5.');for(let i=a;i<=b;i++){if(!out.includes(i-1))out.push(i-1);}}
 if(!out.length)throw Error('Choose at least one page.');return out;
}
export async function loadPdf(bytes){
 const u=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(u.length>MAX_BYTES)throw Error('PDF exceeds 30 MiB.');
 if(!new TextDecoder('ascii').decode(u.subarray(0,1024)).includes('%PDF-'))throw Error('This file is not a readable PDF.');
 let doc;try{doc=await PDFDocument.load(u,{updateMetadata:false,throwOnInvalidObject:true});}catch(e){if(/encrypt/i.test(e.message))throw Error('Password-protected PDFs are not supported. Export an unprotected copy using your document app first.');throw Error('This PDF could not be read. It may be damaged or unsupported.');}
 if(doc.getPageCount()<1||doc.getPageCount()>MAX_PAGES)throw Error('Choose a PDF with 1–150 pages.');
 return doc;
}
export async function inspect(bytes){const d=await loadPdf(bytes);let form=false;try{form=d.getForm().getFields().length>0;}catch{}return {pages:d.getPageCount(),sizes:d.getPages().map(p=>({width:p.getWidth(),height:p.getHeight(),rotation:p.getRotation().angle})),form};}
export async function perform(tool,inputs,options={},progress=()=>{}){
 if(!inputs.length)throw Error('No files selected.');const docs=[];let total=0;
 for(let i=0;i<inputs.length;i++){const d=await loadPdf(inputs[i]);docs.push(d);total+=d.getPageCount();progress(10+Math.round((i+1)/inputs.length*15));}
 if(total>MAX_PAGES)throw Error('The combined task exceeds 150 pages.');
 if(tool!=='merge'&&docs.length!==1)throw Error('This tool works with one PDF at a time.');
 const source=docs[0];let out=await PDFDocument.create();
 if(tool==='merge'){for(const d of docs){for(const p of await out.copyPages(d,d.getPageIndices()))out.addPage(p);}}
 else if(tool==='split'&&options.separate){const selected=parsePages(options.pages||'',source.getPageCount()),files=[];for(let i=0;i<selected.length;i++){const d=await PDFDocument.create();const [p]=await d.copyPages(source,[selected[i]]);d.addPage(p);files.push({name:`page-${String(selected[i]+1).padStart(3,'0')}.pdf`,bytes:await d.save()});progress(25+Math.round((i+1)/selected.length*70));}return {files,pages:files.length};}
 else if(['extract','split','organize','remove'].includes(tool)){
  let selected=options.order??parsePages(options.pages||'',source.getPageCount());
  if(tool==='remove'){const remove=new Set(selected);selected=source.getPageIndices().filter(i=>!remove.has(i));}
  if(!selected.length||selected.some(i=>!Number.isInteger(i)||i<0||i>=source.getPageCount()))throw Error('Keep at least one valid page.');
  for(const p of await out.copyPages(source,selected))out.addPage(p);
 } else if(['rotate','numbers','watermark','optimize'].includes(tool)) {
  out=source;
  if(tool==='rotate'){const selected=parsePages(options.pages||'',out.getPageCount());const angle=Number(options.angle??90);if(![90,180,270].includes(angle))throw Error('Choose a quarter, half or three-quarter turn.');for(const i of selected){const p=out.getPage(i);p.setRotation(degrees((p.getRotation().angle+angle)%360));}}
  if(tool==='numbers'||tool==='watermark'){
   const font=await out.embedFont(StandardFonts.Helvetica);const text=String(options.text||'DRAFT').trim();if(tool==='watermark'&&(!text||text.length>60||/[^\x20-\x7E]/.test(text)))throw Error('Use 1–60 basic Latin characters for the watermark.');
   for(const [i,p] of out.getPages().entries()){
    if(tool==='numbers'){const label=`${i+1} / ${out.getPageCount()}`,s=Math.min(11,p.getWidth()/20);p.drawText(label,{font,size:s,x:(p.getWidth()-font.widthOfTextAtSize(label,s))/2,y:Math.max(5,Math.min(24,p.getHeight()/15)),color:rgb(.35,.35,.4)});}
    else {const size=Math.min(52,(p.getWidth()*.75)/Math.max(1,font.widthOfTextAtSize(text,1)));p.drawText(text,{font,size,x:(p.getWidth()-font.widthOfTextAtSize(text,size))/2,y:p.getHeight()/2,color:rgb(.35,.32,.65),opacity:.22});}
   }
  }
 }else throw Error('Unknown PDF operation.');
 progress(80);const bytes=await out.save({useObjectStreams:true,addDefaultPage:false});const verified=await loadPdf(bytes);progress(100);
 if(tool==='optimize'&&bytes.length>=inputs[0].length)return {bytes:inputs[0],pages:source.getPageCount(),unchanged:true};
 return {bytes,pages:verified.getPageCount(),unchanged:false};
}
// A small ZIP writer using uncompressed entries. No third-party code or ZIP64.
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
export function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function makeZip(files){
 const chunks=[],central=[];let offset=0,centralSize=0;const enc=new TextEncoder();
 for(const f of files){const name=enc.encode(f.name),bytes=f.bytes instanceof Uint8Array?f.bytes:new Uint8Array(f.bytes),crc=crc32(bytes),h=new Uint8Array(30+name.length),v=new DataView(h.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);h.set(name,30);chunks.push(h,bytes);
  const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,crc,true);cv.setUint32(20,bytes.length,true);cv.setUint32(24,bytes.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);c.set(name,46);central.push(c);centralSize+=c.length;offset+=h.length+bytes.length;
 }
 const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);const out=new Uint8Array(offset+centralSize+22);let p=0;for(const chunk of [...chunks,...central,end]){out.set(chunk,p);p+=chunk.length;}return out;
}
