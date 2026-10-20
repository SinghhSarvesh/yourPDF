export const LIMIT_BYTES = 12 * 1024 * 1024;
export const LIMIT_PIXELS = 24_000_000;
export function dimensions(w,h) {
  if (!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000||w*h>LIMIT_PIXELS) throw Error('Image exceeds the supported dimensions: maximum 12,000 pixels per side and 24 megapixels.');
}
export function requirements(r, optional=false) {
  if (!optional) dimensions(r.width,r.height);
  else for (const n of [r.width,r.height]) if(n!==null&&(!Number.isInteger(n)||n<1||n>12000)) throw Error('Dimensions must be whole pixels from 1 to 12,000.');
  if (!Number.isFinite(r.min)||r.min<0||!Number.isFinite(r.max)||r.max<=0||r.min>r.max) throw Error('Enter a positive maximum size and a minimum no greater than the maximum.');
  if (!['image/jpeg','image/png','image/webp','any'].includes(r.format)) throw Error('Unsupported output format.');
  return r;
}
export function checklist(meta,r) {
  return [
    {label:'File format',pass:r.format==='any'||meta.format===r.format,detail:meta.format.replace('image/','').toUpperCase()},
    {label:'Width',pass:r.width===null||meta.width===r.width,detail:`${meta.width} px${r.width===null?' · no constraint':` / ${r.width} required`}`},
    {label:'Height',pass:r.height===null||meta.height===r.height,detail:`${meta.height} px${r.height===null?' · no constraint':` / ${r.height} required`}`},
    {label:'File size',pass:meta.size>=r.min*r.unit&&meta.size<=r.max*r.unit,detail:`${meta.size.toLocaleString('en-IN')} bytes · ${(meta.size/r.unit).toFixed(2)} KB / ${r.min}–${r.max} KB`}
  ];
}
export function rectangle(sw,sh,dw,dh,mode,x=50,y=50,zoom=1) {
  if(mode==='fit') {const s=Math.min(dw/sw,dh/sh);return {sx:0,sy:0,sw,sh,dx:(dw-sw*s)/2,dy:(dh-sh*s)/2,dw:sw*s,dh:sh*s};}
  const s=Math.max(dw/sw,dh/sh)*zoom, cw=dw/s,ch=dh/s;
  return {sx:(sw-cw)*x/100,sy:(sh-ch)*y/100,sw:cw,sh:ch,dx:0,dy:0,dw,dh};
}
// Highest tested quality first. Never pad bytes or silently change dimensions.
export async function chooseEncoding(encode,format,min,max,onProgress=()=>{}) {
  let smallest=null,largest=null;
  const qualities=format==='image/png'?[1]:Array.from({length:56},(_,i)=>(100-i)/100);
  for(let i=0;i<qualities.length;i++) {
    const quality=qualities[i],blob=await encode(quality);
    if(!blob||blob.type!==format) throw Error('This browser could not encode the requested format.');
    if(!smallest||blob.size<smallest.size)smallest=blob;
    if(!largest||blob.size>largest.size)largest=blob;
    onProgress(Math.round((i+1)/qualities.length*100));
    if(blob.size>=min&&blob.size<=max)return {blob,quality};
  }
  if(largest.size<min)throw Error(`The largest tested encoding is ${largest.size} bytes, below your minimum. Use a more detailed original or check the portal limits. We do not pad files with meaningless bytes.`);
  if(smallest.size>max)throw Error(`The smallest tested encoding is ${smallest.size} bytes, above your maximum. ${format==='image/png'?'Try JPG if the portal permits it.':'Try a simpler crop or a larger limit.'} Dimensions were not silently reduced.`);
  throw Error('No tested encoding meets this size range. Widen the range if the portal permits it.');
}
export function header(bytes) {
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), text=(p,n)=>String.fromCharCode(...bytes.slice(p,p+n));
  let width,height,format;
  if(bytes.length>=24&&bytes[0]===137&&text(1,3)==='PNG'&&text(12,4)==='IHDR') {format='image/png';width=v.getUint32(16);height=v.getUint32(20);}
  else if(bytes.length>=30&&text(0,4)==='RIFF'&&text(8,4)==='WEBP') {
    format='image/webp';const kind=text(12,4);
    if(kind==='VP8X'){width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16);height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16);}
    else if(kind==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42){width=v.getUint16(26,true)&16383;height=v.getUint16(28,true)&16383;}
    else if(kind==='VP8L'&&bytes[20]===47){const bits=v.getUint32(21,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
    else throw Error('Unrecognized WebP header. Export a fresh JPG or PNG.');
    if(kind==='VP8X'&&(bytes[20]&2))throw Error('Animated WebP is not supported. Export a still image.');
  }
  else if(bytes.length>4&&bytes[0]===255&&bytes[1]===216) {
    format='image/jpeg';let p=2;
    while(p+3<bytes.length){if(bytes[p++]!==255)throw Error('Invalid JPEG header.');while(bytes[p]===255)p++;const marker=bytes[p++];if(marker===217||marker===218)break; if(marker===1||(marker>=208&&marker<=215))continue;const length=v.getUint16(p);if(length<2||p+length>bytes.length)throw Error('Truncated JPEG file.');if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){height=v.getUint16(p+3);width=v.getUint16(p+5);break;}p+=length;}
  } else throw Error('Unsupported file. Choose a JPG, PNG, or still WebP image. PDF support is planned for the next release.');
  dimensions(width,height);return {width,height,format};
}
