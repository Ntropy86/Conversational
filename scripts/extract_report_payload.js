const fs = require('fs');
const path = require('path');
const reportPath = path.resolve(__dirname, '../frontend/.next/report.html');
const raw = fs.readFileSync(reportPath, 'utf8');

function findNearToken(token){
  const i = raw.indexOf(token);
  return i;
}

function extractJSONAround(index){
  // walk backwards to find the opening '[' or '{'
  let start = index;
  while(start>0 && !/[\[{]/.test(raw[start])) start--;
  if(start===0) return null;
  const openChar = raw[start];
  const closeChar = openChar==='['?']':'}';
  let depth = 0;
  let end = start;
  for(let i=start;i<raw.length;i++){
    const ch = raw[i];
    if(ch===openChar) depth++;
    else if(ch===closeChar){ depth--; if(depth===0){ end=i; break; }}
  }
  if(end<=start) return null;
  return raw.slice(start, end+1);
}

function sanitize(s){
  // remove trailing commas before closing brackets/braces
  return s.replace(/,\s*([}\]])/g, '$1');
}

const idx = findNearToken('statSize');
if(idx===-1){
  console.error('token statSize not found in report');
  process.exit(2);
}
const extracted = extractJSONAround(idx);
if(!extracted){
  console.error('failed to extract JSON around token');
  process.exit(3);
}
let jsonText = sanitize(extracted);
// If the payload uses single quotes, convert to double quotes conservatively
jsonText = jsonText.replace(/\bundefined\b/g, 'null');

try{
  const data = JSON.parse(jsonText);
  console.log('extracted JSON root type:', Array.isArray(data)?'array':'object');
  // print compact summary
  if(Array.isArray(data)){
    let totalStat=0, totalParsed=0, totalGzip=0;
    data.forEach(c=>{ totalStat+=c.statSize||0; totalParsed+=c.parsedSize||0; totalGzip+=c.gzipSize||0 });
    function fmt(n){ return isFinite(n)?Math.round(n/1024*10)/10+' KB':'-'; }
    data.sort((a,b)=>(b.statSize||0)-(a.statSize||0));
    console.log('chunks:', data.length);
    console.log('total statSize:',fmt(totalStat),' total parsedSize:',fmt(totalParsed),' total gzipSize:',fmt(totalGzip));
    console.log('\nTop 8 chunks by statSize:');
    data.slice(0,8).forEach((c,idx)=>{
      console.log(`\n#${idx+1} name:${c.label||c.name||c.id||'(unknown)'} id:${c.id||'?'} stat:${fmt(c.statSize||0)} parsed:${fmt(c.parsedSize||0)} gzip:${fmt(c.gzipSize||0)} modules:${c.groups? 'has groups':'no groups'}`);
      if(c.groups){
        const mods = [];
        function collect(g){ for(const m of g){ if(m.path) mods.push({path:m.path,stat:m.statSize||0,parsed:m.parsedSize||0}); if(m.groups) collect(m.groups); if(mods.length>=6) return; }}
        collect(c.groups);
        if(mods.length){ console.log('  example modules:'); mods.forEach(m=>console.log(`    - ${m.path} stat:${Math.round((m.stat||0)/1024*10)/10} KB parsed:${Math.round((m.parsed||0)/1024*10)/10} KB`)); }
      }
    });
  } else {
    console.log('root object keys:', Object.keys(data));
  }
}catch(err){
  console.error('JSON.parse failed:', err.message);
  console.log('sanitized head:');
  console.log(jsonText.slice(0,2000));
  process.exit(4);
}
