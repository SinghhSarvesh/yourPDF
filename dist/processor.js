import {header,dimensions,LIMIT_BYTES,rectangle,chooseEncoding,checklist,requirements} from './core.js';
let bitmap=null,meta=null;
const canvas=(w,h)=>{const c=new OffscreenCanvas(w,h);const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas memory unavailable. Try a smaller image.');return [c,ctx];};
self.onmessage=async({data})=>{
 try {
  if(data.action==='load') {
    bitmap?.close();bitmap=null;meta=null;
    const f=data.file;if(f.size>LIMIT_BYTES)throw Error('This image is too large. The input limit is 12 MiB.');
    const h=header(new Uint8Array(await f.arrayBuffer()));
    if(typeof OffscreenCanvas==='undefined'||typeof createImageBitmap==='undefined')throw Error('Use an up-to-date Chrome, Edge, Firefox, or Safari browser with worker image support.');
    bitmap=await createImageBitmap(f,{imageOrientation:'from-image'});dimensions(bitmap.width,bitmap.height);
    meta={width:bitmap.width,height:bitmap.height,format:h.format,size:f.size};
    const s=Math.min(1,900/Math.max(bitmap.width,bitmap.height));const [c,ctx]=canvas(Math.max(1,Math.round(bitmap.width*s)),Math.max(1,Math.round(bitmap.height*s)));ctx.drawImage(bitmap,0,0,c.width,c.height);
    self.postMessage({type:'loaded',meta,preview:await c.convertToBlob({type:'image/png'})});
  } else if(data.action==='process') {
    if(!bitmap)throw Error('Choose an image first.');
    const r=requirements(data.requirements,data.checkOnly);
    if(data.checkOnly){self.postMessage({type:'checked',checks:checklist(meta,r)});return;}
    const turn=data.rotation%4, rw=turn%2?bitmap.height:bitmap.width,rh=turn%2?bitmap.width:bitmap.height;
    const [rot,rc]=canvas(rw,rh);rc.translate(rw/2,rh/2);rc.rotate(turn*Math.PI/2);rc.drawImage(bitmap,-bitmap.width/2,-bitmap.height/2);
    const [out,ctx]=canvas(r.width,r.height);ctx.fillStyle='white';ctx.fillRect(0,0,r.width,r.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const p=rectangle(rw,rh,r.width,r.height,data.mode,data.x,data.y,data.zoom);ctx.drawImage(rot,p.sx,p.sy,p.sw,p.sh,p.dx,p.dy,p.dw,p.dh);rot.width=1;rot.height=1;
    const result=await chooseEncoding(q=>out.convertToBlob({type:r.format,quality:q}),r.format,r.min*r.unit,r.max*r.unit,p=>self.postMessage({type:'progress',value:p}));
    const verified=await createImageBitmap(result.blob);const actual={width:verified.width,height:verified.height,size:result.blob.size,format:header(new Uint8Array(await result.blob.arrayBuffer())).format};verified.close();
    const checks=checklist(actual,r);if(checks.some(c=>!c.pass))throw Error('Output verification failed. Nothing has been offered for download.');
    const scale=Math.min(1,900/Math.max(out.width,out.height));const [preview,pc]=canvas(Math.max(1,Math.round(out.width*scale)),Math.max(1,Math.round(out.height*scale)));pc.drawImage(out,0,0,preview.width,preview.height);
    self.postMessage({type:'result',blob:result.blob,preview:await preview.convertToBlob({type:'image/png'}),meta:actual,quality:result.quality,checks});out.width=1;out.height=1;
  }
 }catch(e){self.postMessage({type:'error',message:e instanceof Error?e.message:'Could not process this image. Try a smaller file.'});}
};
