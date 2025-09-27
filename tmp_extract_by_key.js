const fs = require('fs');
const vm = require('vm');
const path = require('path');
const reportPath = path.resolve(__dirname, 'frontend/.next/report.html');
const s = fs.readFileSync(reportPath, 'utf8');
const key = '"statSize"';
let idx = s.indexOf(key);
if (idx === -1) { console.error('statSize key not found'); process.exit(2); }
// expand backwards to find the start of an array '[' or '{' preceding this occurrence
let start = s.lastIndexOf('[', idx);
let start2 = s.lastIndexOf('{', idx);
start = Math.max(start, start2);
if (start === -1) { console.error('cannot find array/object start before statSize'); process.exit(3); }
// find the matching closing bracket ']' or '}'
let open = s[start];
let close = open === '[' ? ']' : '}';
let depth = 0;
let end = -1;
for (let i = start; i < s.length; i++) {
  const ch = s[i];
  if (ch === open) depth++;
  else if (ch === close) { depth--; if (depth === 0) { end = i; break; } }
}
if (end === -1) { console.error('matching close not found'); process.exit(4); }
const payload = s.slice(start, end + 1);
// sanity trim to limit size
const MAX = 3 * 1024 * 1024; // 3MB
let trimmed = payload;
if (payload.length > MAX) {
  // try to shrink by finding the nearest array that contains "statSize"
  const subStart = s.lastIndexOf('[', idx - 1000);
  if (subStart !== -1 && subStart > start) {
    let d = 0, e = -1;
    for (let i = subStart; i < s.length && i < subStart + 2000000; i++) {
      if (s[i] === '[') d++; else if (s[i] === ']') { d--; if (d === 0) { e = i; break; } }
    }
    if (e !== -1) trimmed = s.slice(subStart, e + 1);
  }
}
try {
  const data = vm.runInNewContext('(' + trimmed + ')');
  if (!Array.isArray(data)) { console.error('extracted payload is not an array'); process.exit(5); }
  // produce compact summary
  let totalStat = 0, totalParsed = 0, totalGzip = 0;
  data.forEach(c => { totalStat += c.statSize || 0; totalParsed += c.parsedSize || 0; totalGzip += c.gzipSize || 0; });
  function fmt(n){ return isFinite(n) ? (Math.round(n/1024*10)/10 + ' KB') : '-'; }
  data.sort((a,b)=>(b.statSize||0)-(a.statSize||0));
  console.log('chunks:', data.length);
  console.log('total statSize:', fmt(totalStat), ' total parsedSize:', fmt(totalParsed), ' total gzipSize:', fmt(totalGzip));
  console.log('\nTop 12 chunks by statSize:');
  data.slice(0,12).forEach((c,idx)=>{
    console.log(`\n#${idx+1} name:${c.label||c.name||c.id||"(unknown)"} id:${c.id||"?"} stat:${fmt(c.statSize||0)} parsed:${fmt(c.parsedSize||0)} gzip:${fmt(c.gzipSize||0)} modules:${(c.groups?"has groups":"no groups")}`);
    if (c.groups){
      let mods = [];
      const collect = (g,acc,limit)=>{
        for (const m of g){
          if (m.path) acc.push({path:m.path, stat:m.statSize||0, parsed:m.parsedSize||0});
          if (m.groups) collect(m.groups, acc, limit);
          if (acc.length>=limit) break;
        }
      };
      collect(c.groups, mods, 6);
      if (mods.length){
        console.log('  example modules:');
        mods.forEach(m=>console.log(`    - ${m.path} stat:${fmt(m.stat)} parsed:${fmt(m.parsed)}`));
      }
    }
  });
} catch (err) {
  console.error('eval failed:', err.message);
  console.log('trimmed payload head:');
  console.log(trimmed.slice(0,2000));
  process.exit(6);
}
