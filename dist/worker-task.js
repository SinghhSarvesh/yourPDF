// One active task, with identical cleanup for every terminal outcome.
export function createWorkerTask(createWorker,onProgress=()=>{},{setTimer=setTimeout,clearTimer=clearTimeout,timeout=60000}={}) {
 let active;
 function cancel(){active?.finish(new Error('Task cancelled. Your original files are unchanged.'));}
 function run(data){
  cancel();
  return new Promise((resolve,reject)=>{
   let worker,timer,settled=false;
   const task={finish(error,result){
    if(settled)return;
    settled=true;
    if(timer!==undefined)clearTimer(timer);
    if(worker){worker.onmessage=null;worker.onerror=null;worker.onmessageerror=null;worker.terminate();}
    if(active===task)active=undefined;
    if(error)reject(error);else resolve(result);
   }};
   active=task;
   try{
    worker=createWorker();
    timer=setTimer(()=>task.finish(new Error('Processing timed out. Try a smaller document.')),timeout);
    worker.onmessage=({data:result})=>{
     if(settled)return;
     if(result.type==='progress'){onProgress(result.value);return;}
     task.finish(result.type==='error'?new Error(result.message):null,result);
    };
    worker.onerror=()=>task.finish(new Error('The PDF worker could not run. Try a current browser or a smaller document.'));
    worker.onmessageerror=()=>task.finish(new Error('The worker result could not be read. Try again.'));
    worker.postMessage(data);
   }catch(error){task.finish(error);}
  });
 }
 return {run,cancel};
}
