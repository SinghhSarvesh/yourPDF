// Shared validation: deliberately independent of PDF rendering libraries.
export const MAX_BYTES=30*1024*1024,MAX_PAGES=150,MAX_FILES=20;
export function validateFiles(files){if(!files.length)throw Error('Choose a file first.');if(files.length>MAX_FILES)throw Error('Choose up to 20 files per task.');if(files.reduce((n,f)=>n+f.size,0)>MAX_BYTES)throw Error('This task exceeds the 30 MiB combined file limit. Try fewer or smaller files.');}
export function parsePages(text,count){
 if(!text.trim())return Array.from({length:count},(_,i)=>i);
 const out=[];for(const part of text.split(',')){const m=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!m)throw Error('Use page numbers like 1, 3-5, 8.');const a=Number(m[1]),b=m[2]?Number(m[2]):a;if(a<1||b<1||a>count||b>count)throw Error(`Choose pages between 1 and ${count}.`);if(b<a)throw Error('Page ranges must go forwards, for example 2-5.');for(let i=a;i<=b;i++){if(!out.includes(i-1))out.push(i-1);}}
 if(!out.length)throw Error('Choose at least one page.');return out;
}
