import test from 'node:test';
import assert from 'node:assert/strict';
import {openLocalPdf} from '../dist/pdf-preview.js';
test('preview adapter releases PDF.js 6 loading task after use',async()=>{
 let destroyed=0;const document={numPages:1};const task={promise:Promise.resolve(document),destroy:async()=>{destroyed++;}};
 const lib={getDocument(options){assert.equal(options.isEvalSupported,false);assert.equal(options.enableXfa,false);return task;}};
 const result=await openLocalPdf(lib,new Uint8Array([1]));assert.equal(result.numPages,1);await result.destroy();assert.equal(destroyed,1);
});
test('failed preview load still releases task and preserves original error',async()=>{
 const original=new Error('damaged document');let destroyed=false;
 const lib={getDocument:()=>({promise:Promise.reject(original),destroy:async()=>{destroyed=true;}})};
 await assert.rejects(openLocalPdf(lib,new Uint8Array()),e=>e===original);assert.equal(destroyed,true);
});
