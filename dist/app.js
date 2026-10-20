import {attachDownload,showEmbeddedNotice} from './downloads.js';
import {requirements} from './core.js';
const $=id=>document.getElementById(id), checker=document.body.dataset.tool==='checker';
let releaseDownload=null;
let worker=null,loaded=false,meta=null,rotation=0,urls=[],outputUrls=[],timer=null,busy=false;
function url(blob){const u=URL.createObjectURL(blob);urls.push(u);return u;}
function status(text,error=false){$('status').textContent=text;$('status').className='status'+(error?' error':'');}
function invalidate(){ releaseDownload?.();releaseDownload=null; outputUrls.forEach(URL.revokeObjectURL);urls=urls.filter(u=>!outputUrls.includes(u));outputUrls=[]; $('download').hidden=true;$('after').hidden=true;$('after').removeAttribute('src');$('after-empty').hidden=false;$('result-meta').textContent='No verified output yet';$('checks').replaceChildren();$('result-note').textContent='Run the check to see measured results.';}
function locked(value){busy=value;$('controls').disabled=value;$('file').disabled=value;$('run').disabled=value||!loaded;$('progress').hidden=!value;if(value){clearTimeout(timer);timer=setTimeout(()=>{worker?.terminate();loaded=false;locked(false);status('Processing took too long and was stopped. Choose a smaller image to retry.',true);},45000);}else clearTimeout(timer);}
function workerStart(){worker?.terminate();worker=new Worker('/processor.js',{type:'module'});worker.onerror=()=>{loaded=false;locked(false);status('The image processor could not start. Try a current browser or reload this page.',true);};worker.onmessage=({data:d})=>{
 if(d.type==='progress'){$('progress').value=d.value;return;}
 locked(false);
 if(d.type==='error'){status(d.message,true);return;}
 if(d.type==='loaded'){
  loaded=true;meta=d.meta;rotation=0;$('run').disabled=false;$('before').src=url(d.preview);$('before').hidden=false;$('before-empty').hidden=true;$('original-meta').textContent=`${meta.width} × ${meta.height} px · ${meta.format.replace('image/','').toUpperCase()} · ${meta.size.toLocaleString('en-IN')} bytes`;
  if(!checker){$('width').value=meta.width;$('height').value=meta.height;}
  status('Image loaded on your device. Set the requirements from your application portal.');return;
 }
 if(d.checks){renderChecks(d.checks);const pass=d.checks.every(c=>c.pass);status(pass?'All specified technical checks pass. Inspect readability before using the file.':'Some requirements do not match. Review the failed checks.',!pass);$('result-note').textContent='Technical checks only. Face position, background, signature legibility, DPI, and portal-specific rules are not checked.';}
 if(d.type==='result'){
  $('after').src=url(d.preview);outputUrls.push($('after').src);$('after').hidden=false;$('after-empty').hidden=true;$('result-meta').textContent=`${d.meta.width} × ${d.meta.height} px · ${d.meta.format.replace('image/','').toUpperCase()} · ${d.meta.size.toLocaleString('en-IN')} bytes`;
  const a=$('download');releaseDownload=attachDownload(a,d.blob,`${document.body.dataset.tool}-${d.meta.width}x${d.meta.height}.${d.meta.format==='image/jpeg'?'jpg':'png'}`);a.hidden=false;
  $('result-note').textContent+=` ${d.meta.format==='image/jpeg'?`Encoder quality setting: ${Math.round(d.quality*100)}%. This is not a readability score. `:''}White background is applied to transparent areas. Enlarging an image cannot restore missing detail.`;
 }
};}
function renderChecks(checks){$('checks').replaceChildren();for(const c of checks){const li=document.createElement('li'),a=document.createElement('span'),b=document.createElement('span');a.className=c.pass?'pass':'fail';a.textContent=`${c.pass?'✓ PASS':'✕ FAIL'} · ${c.label}`;b.className='check-detail';b.textContent=c.detail;li.append(a,b);$('checks').append(li);}}
async function load(file){if(!file||busy)return;invalidate();urls.forEach(URL.revokeObjectURL);urls=[];loaded=false;meta=null;$('before').hidden=true;$('before').removeAttribute('src');$('before-empty').hidden=false;$('original-meta').textContent='';workerStart();locked(true);status('Reading image locally…');worker.postMessage({action:'load',file});}
$('file').addEventListener('change',e=>load(e.target.files[0]));
const drop=$('drop');for(const type of ['dragenter','dragover'])drop.addEventListener(type,e=>{e.preventDefault();drop.classList.add('drag');});for(const type of ['dragleave','drop'])drop.addEventListener(type,e=>{e.preventDefault();drop.classList.remove('drag');});drop.addEventListener('drop',e=>load(e.dataTransfer.files[0]));
$('settings').addEventListener('input',e=>{
 invalidate();if(loaded)status('Settings changed. Run again to verify the new result.');
 if(!checker&&meta&&$('ratio').checked&&['width','height'].includes(e.target.id)){
  const r=rotation%2?meta.height/meta.width:meta.width/meta.height;
  if(e.target.id==='width')$('height').value=Math.max(1,Math.round(Number($('width').value)/r));else $('width').value=Math.max(1,Math.round(Number($('height').value)*r));
 }
 if(!checker){$('crop-settings').hidden=$('mode').value!=='crop';for(const name of ['x','y','zoom'])$(name+'-value').textContent=$(name).value;}
});
if(!checker){$('rotate').onclick=()=>{if(!loaded)return;rotation=(rotation+1)%4;const w=$('width').value;$('width').value=$('height').value;$('height').value=w;$('rotation').textContent=`${rotation*90}° clockwise`;invalidate();status('Rotation changed. Prepare the image to view the result.');};$('ratio').onchange=()=>{if(meta&&$('ratio').checked){const r=rotation%2?meta.height/meta.width:meta.width/meta.height;$('height').value=Math.max(1,Math.round(Number($('width').value)/r));}};}
$('settings').addEventListener('submit',e=>{e.preventDefault();if(!loaded||busy)return;invalidate();try{
 const val=id=>$(id).value===''?null:Number($(id).value);
 const r=requirements({width:val('width'),height:val('height'),format:$('format').value,min:val('min')??0,max:val('max'),unit:Number($('unit').value)},checker);
 if(!checker&&r.width*r.height>8_000_000)throw Error('Output is limited to 8 megapixels to protect device memory.');
 locked(true);status(checker?'Checking the original file…':'Preparing and verifying your image…');worker.postMessage({action:'process',requirements:r,checkOnly:checker,rotation,mode:checker?'fit':$('mode').value,x:checker?50:Number($('x').value),y:checker?50:Number($('y').value),zoom:checker?1:Number($('zoom').value)});
 }catch(err){status(err.message,true);}});
$('reset').onclick=()=>{worker?.terminate();clearTimeout(timer);loaded=false;meta=null;rotation=0;locked(false);$('settings').reset();$('file').value='';invalidate();$('before').hidden=true;$('before').removeAttribute('src');$('before-empty').hidden=false;$('original-meta').textContent='Waiting for an image';urls.forEach(URL.revokeObjectURL);urls=[];if(!checker){$('rotation').textContent='0° clockwise';$('crop-settings').hidden=true;}status('Ready for a new image.');};
window.addEventListener('pagehide',()=>{worker?.terminate();});showEmbeddedNotice($('main'));
