import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkerTask} from '../dist/worker-task.js';
function harness(){
 const workers=[],timers=new Map();let id=0;
 const runner=createWorkerTask(()=>{const w={terminated:0,postMessage(){},terminate(){this.terminated++;}};workers.push(w);return w;},()=>{}, {setTimer:fn=>{timers.set(++id,fn);return id;},clearTimer:id=>timers.delete(id)});
 return {runner,workers,timers};
}
test('cancel clears timers and stale responses cannot settle a retry',async()=>{
 const {runner,workers,timers}=harness();const a=runner.run({});const rejection=assert.rejects(a,/cancelled/);const stale=workers[0].onmessage;
 runner.cancel();await rejection;assert.equal(timers.size,0);assert.equal(workers[0].terminated,1);
 const b=runner.run({});stale({data:{type:'result',value:'old'}});workers[1].onmessage({data:{type:'result',value:'new'}});
 assert.equal((await b).value,'new');assert.equal(timers.size,0);assert.equal(workers[1].terminated,1);
});
test('all terminal worker paths release timers and workers',async()=>{
 for(const mode of ['success','error','messageerror','timeout']){
  const {runner,workers,timers}=harness();const p=runner.run({});
  if(mode==='success'){workers[0].onmessage({data:{type:'result'}});await p;}
  else{const rejection=assert.rejects(p);if(mode==='error')workers[0].onerror();else if(mode==='messageerror')workers[0].onmessageerror();else [...timers.values()][0]();await rejection;}
  assert.equal(timers.size,0);assert.equal(workers[0].terminated,1);
 }
 let terminated=false;const runner=createWorkerTask(()=>({postMessage(){throw Error('clone failed');},terminate(){terminated=true;}}));
 await assert.rejects(runner.run({}),/clone failed/);assert.ok(terminated);
});
