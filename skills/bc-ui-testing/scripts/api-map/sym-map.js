// node sym-map.js <root> <out.csv> : API pages/queries -> tabla, desde SymbolReference.json
const fs = require('fs'), path = require('path');
const [root, out] = process.argv.slice(2);
const rows = [];
const P = (o, n) => ((o.Properties || []).find(p => p.Name === n) || {}).Value;
function firstTable(o) {
  for (const k of ['DataItems', 'Elements']) for (const e of (o[k] || [])) {
    if (e.RelatedTable) return e.RelatedTable; const r = firstTable(e); if (r) return r;
  }
  return null;
}
function walk(n, app) {
  for (const kind of ['Pages', 'Queries']) for (const o of (n[kind] || [])) {
    if (P(o, 'PageType') !== 'API' && P(o, 'QueryType') !== 'API') continue;
    const src = kind === 'Pages' ? P(o, 'SourceTable') : firstTable(o);
    const pub = P(o, 'APIPublisher'), grp = P(o, 'APIGroup');
    for (let v of String(P(o, 'APIVersion') || 'beta').split(',')) {
      v = v.replace(/'/g, '').trim() || 'beta';
      rows.push([pub ? `${pub}/${grp}/${v}` : v, P(o, 'EntitySetName'), `${kind === 'Pages' ? 'page' : 'query'} ${o.Id} ${o.Name}`, src || '', app]);
    }
  }
  for (const ns of (n.Namespaces || [])) walk(ns, app);
}
function find(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) find(p);
  else if (f.name === 'SymbolReference.json') {
    let s = fs.readFileSync(p, 'utf8').replace(/^﻿/, '');
    try { walk(JSON.parse(s), path.basename(d)); }
    catch (e) { const m = /position (\d+)/.exec(e.message);
      try { walk(JSON.parse(s.slice(0, +m[1])), path.basename(d)); console.log('recortado', path.basename(d), s.length - m[1], 'chars basura') }
      catch (e2) { console.log('ERR', p, e2.message); } }
  } } }
find(root);
fs.writeFileSync(out, '"Ruta","Entidad","Objeto","Tabla","App"\n' + rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n'));
const g = {}; rows.forEach(r => g[r[0]] = (g[r[0]] || 0) + 1); console.log(g); console.log(rows.slice(0, 3));
