const fs = require('fs');
const vm = require('vm');
const path = require('path');
const reportPath = path.resolve(__dirname, 'frontend/.next/report.html');
const s = fs.readFileSync(reportPath, 'utf8');
const key = 'setModules(';
let idx = s.indexOf(key);
if (idx === -1) {
  console.error('setModules not found');
  process.exit(2);
}
let i = idx + key.length;
let depth = 1;
for (; i < s.length; i++) {
  const ch = s[i];
  if (ch === '(') depth++;
  else if (ch === ')') {
    depth--;
    if (depth === 0) break;
  }
}
if (i >= s.length) {
  console.error('matching closing paren not found');
  process.exit(3);
}
const payload = s.slice(idx + key.length, i);
let data;
try {
  // evaluate in a safe context
  data = vm.runInNewContext('(' + payload + ')');
} catch (err) {
  console.error('eval failed:', err.message);
  console.log('payload head:');
  console.log(payload.slice(0, 2000));
  process.exit(4);
}
if (!Array.isArray(data)) {
  console.error('extracted payload is not an array');
  process.exit(5);
}
let totalStat = 0, totalParsed = 0, totalGzip = 0;
data.forEach(c => { totalStat += c.statSize || 0; totalParsed += c.parsedSize || 0; totalGzip += c.gzipSize || 0 });
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
