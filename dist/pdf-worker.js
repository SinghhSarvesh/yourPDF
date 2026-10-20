import {inspect,perform,makeZip,validateFiles,MAX_PAGES,loadPdf} from './pdf-core.js';
import {PDFDocument} from './vendor/pdf-lib.js';
import {header} from './core.js';
self.onmessage=async({data:d})=>{try{
 if(d.action==='inspect') {const result=[];validateFiles(d.files);for(const f of d.files)result.push(await inspect(new Uint8Array(await f.arrayBuffer())));if(result.reduce((n,r)=>n+r.pages,0)>MAX_PAGES)throw Error('This task exceeds the combined 150-page limit.');self.postMessage({type:'inspected',items:result});return;}
 if(d.action==='zip'){const bytes=makeZip(d.files);self.postMessage({type:'result',blob:new Blob([bytes],{type:'application/zip'}),pages:d.files.length,extension:'zip'});return;}
 validateFiles(d.files);
 if(d.tool==='images'){
  const doc=await PDFDocument.create();for(let i=0;i<d.files.length;i++){
   const f=d.files[i],bytes=new Uint8Array(await f.arrayBuffer());header(bytes);const bitmap=await createImageBitmap(f,{imageOrientation:'from-image'});if(bitmap.width*bitmap.height>24_000_000){bitmap.close();throw Error('An image exceeds 24 megapixels.');}
   const scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));const c=new OffscreenCanvas(Math.max(1,Math.round(bitmap.width*scale)),Math.max(1,Math.round(bitmap.height*scale))),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();
   const jpg=new Uint8Array(await (await c.convertToBlob({type:'image/jpeg',quality:.92})).arrayBuffer());const image=await doc.embedJpg(jpg);let w=595.28,h=841.89;if(d.options.orientation==='landscape')[w,h]=[h,w];const page=doc.addPage([w,h]);const margin=d.options.margin===false?0:24;const ratio=Math.min((w-2*margin)/image.width,(h-2*margin)/image.height);page.drawImage(image,{x:(w-image.width*ratio)/2,y:(h-image.height*ratio)/2,width:image.width*ratio,height:image.height*ratio});self.postMessage({type:'progress',value:Math.round((i+1)/d.files.length*90)});
  }const bytes=await doc.save();const verified=await loadPdf(bytes);self.postMessage({type:'result',blob:new Blob([bytes],{type:'application/pdf'}),pages:verified.getPageCount(),extension:'pdf'});return;
 }
 const inputs=[];for(const f of d.files)inputs.push(new Uint8Array(await f.arrayBuffer()));const result=await perform(d.tool,inputs,d.options,v=>self.postMessage({type:'progress',value:v}));
 const bytes=result.files?makeZip(result.files):result.bytes;self.postMessage({type:'result',blob:new Blob([bytes],{type:result.files?'application/zip':'application/pdf'}),extension:result.files?'zip':'pdf',pages:result.pages,unchanged:result.unchanged});
}catch(e){self.postMessage({type:'error',message:e.message||'We could not process this file. Try a smaller, unprotected PDF.'});}};
