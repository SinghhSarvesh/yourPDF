const TYPES={'application/pdf':'.pdf','application/zip':'.zip','image/jpeg':'.jpg','image/png':'.png'};
export function downloadName(name,type){const ext=TYPES[type];if(!ext)throw Error('Unsupported download format.');const stem=String(name||'document').replace(/\.[a-z0-9]+$/i,'').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').slice(0,120)||'document';return stem+ext;}
export async function saveWithPicker(blob,name,picker){
 if(!blob||!blob.size)throw Error('The output is empty. Please process the file again.');
 const filename=downloadName(name,blob.type);
 const handle=await picker({suggestedName:filename,types:[{description:'Prepared file',accept:{[blob.type]:[TYPES[blob.type]]}}]});
 const stream=await handle.createWritable();try{await stream.write(blob);await stream.close();}catch(error){try{await stream.abort();}catch{}throw error;}
 return filename;
}
// Keep a real user-activated link as the cross-browser baseline. Native Save As is optional.
export function attachDownload(anchor,blob,name,onStatus=()=>{}){
 if(!blob||blob.size===0)throw Error('No output was produced. Please process the file again.');
 const filename=downloadName(name,blob.type),url=URL.createObjectURL(blob);
 anchor.href=url;anchor.download=filename;anchor.target='_blank';anchor.rel='noopener';anchor.hidden=false;
 const controls=document.createElement('div');controls.className='download-options';
 const note=document.createElement('p');note.className='download-help';note.textContent='If your browser opens the file, use its Save or Download button. Keep this tab open until saving finishes.';
 const status=text=>{note.textContent=text;onStatus(text);};
 anchor.onclick=()=>{status('Download requested. Check your browser’s Downloads list. If nothing appears, use Save as or open the file below.');};
 if(typeof window.showSaveFilePicker==='function'&&window.top===window.self){const save=document.createElement('button');save.type='button';save.className='button secondary';save.textContent='Save as…';save.onclick=async()=>{save.disabled=true;try{const saved=await saveWithPicker(blob,filename,window.showSaveFilePicker.bind(window));status('Saved '+saved+'.');}catch(e){if(e.name==='AbortError')status('Save cancelled. Your output is still available.');else status('Save as is unavailable here. Use the Download link or open the file in a new tab.');}finally{save.disabled=false;}};controls.append(save);}
 if(blob.type!=='application/zip'){const open=document.createElement('a');open.href=url;open.target='_blank';open.rel='noopener';open.className='button';open.textContent='Open file';controls.append(open);}
 const file=new File([blob],filename,{type:blob.type});
 if(navigator.canShare?.({files:[file]})){const share=document.createElement('button');share.type='button';share.className='button';share.textContent='Share / Save to Files';share.onclick=async()=>{try{await navigator.share({files:[file]});status('File handed to your device’s sharing service.');}catch(e){status(e.name==='AbortError'?'Sharing cancelled. Your output is still available.':'Sharing is unavailable. Use the Download link.');}};controls.append(share);}
 anchor.parentElement.insertAdjacentElement('afterend',controls);controls.insertAdjacentElement('afterend',note);
 return ()=>{anchor.onclick=null;anchor.removeAttribute('href');controls.remove();note.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);};
}
export function showEmbeddedNotice(parent){if(window.top===window.self)return;const note=document.createElement('div');note.className='embedded-notice';note.append(document.createTextNode('Your browser may restrict downloads inside this preview. '));const a=document.createElement('a');a.href=location.href;a.target='_blank';a.rel='noopener';a.textContent='Open the full site in a browser tab';note.append(a,document.createTextNode(' before choosing your files.'));parent.prepend(note);}
