// node merge.js <scratch> -> api-tablas.md + resumen
const fs = require('fs'), path = require('path');
const sp = process.argv[2];
const id2n = {}, n2id = {};
function scan(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) scan(p);
  else if (f.name.endsWith('.al')) { const m = /^\s*table\s+(\d+)\s+("([^"]+)"|(\S+))/m.exec(fs.readFileSync(p, 'utf8')); if (m) { const n = m[3] || m[4]; id2n[m[1]] = n; n2id[n] = m[1]; } }
} }
for (const d of ['BaseApp', 'SysApp', 'Sust', 'APIV2', 'EDoc', 'QM', 'Apps']) scan(path.join(sp, d));
const csv = f => fs.readFileSync(path.join(sp, f), 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1).map(l => l.slice(1, -1).split('","'));
const map = {}; // key ruta|entidad -> {tabla, obj, tmp}
const route = r => { r = r.replace(/\/$/, '/beta'); return r || 'beta'; };
for (const [r, e, o, t, tmp] of csv('api-map.csv')) map[route(r) + '|' + e] = { t, o, tmp: tmp === 'True' };
for (const [r, e, o, t] of csv('sym-map.csv')) {
  const rr = r.replace('analytics/beta', 'analytics/v1.0');
  const k = rr + '|' + e; if (!map[k]) map[k] = { t: /^\d+$/.test(t) ? (id2n[t] || '') : t, id: /^\d+$/.test(t) ? t : '', o };
  if (rr.includes('analytics/v1.0') && !map['microsoft/analytics/v0.5|' + e]) map['microsoft/analytics/v0.5|' + e] = map[k];
}
// entidades reales del entorno (del inventario)
const inv = fs.readFileSync(path.join(sp, 'inventario.txt'), 'utf8').trim().split(/\r?\n/).map(l => l.split('\t'));
const common = new Set(['apicategoryroutes', 'companies', 'entityDefinitions', 'externalbusinesseventdefinitions', 'externaleventsubscriptions', 'subscriptions']);
const REAL = {
  'Sales Invoice Entity Aggregate': 'Sales Header (36) + Sales Invoice Header (112)',
  'Sales Invoice Line Aggregate': 'Sales Line (37) + Sales Invoice Line (113)',
  'Sales Cr. Memo Entity Buffer': 'Sales Header (36) + Sales Cr.Memo Header (114)',
  'Sales Order Entity Buffer': 'Sales Header (36)',
  'Sales Quote Entity Buffer': 'Sales Header (36)',
  'Purch. Inv. Entity Aggregate': 'Purchase Header (38) + Purch. Inv. Header (122)',
  'Purch. Inv. Line Aggregate': 'Purchase Line (39) + Purch. Inv. Line (123)',
  'Purch. Cr. Memo Entity Buffer': 'Purchase Header (38) + Purch. Cr. Memo Hdr. (124)',
  'Purchase Order Entity Buffer': 'Purchase Header (38)',
};
let md = '', miss = [], n = 0;
let last = '';
for (const [r, e] of inv) {
  if (common.has(e)) continue;
  const m = map[r + '|' + e] || map[r.replace(/v1\.0$|beta$/, 'v2.0') + '|' + e] || map[r.replace('analytics/v0.5', 'analytics/v1.0') + '|' + e];
  if (r !== last) { md += `\n### ${r}\n| Entidad | Tabla (ID) | Objeto API |\n|---|---|---|\n`; last = r; }
  let tab = '¿?', obj = '';
  const SIN = { dateSetups: 'sin tabla (página calculada)', workingDays: 'sin tabla (página calculada)', file: 'sin tabla (carga de fichero)', vatGroupSubmissionLines: '¿? (no está en el paquete descargado)' };
  if (!m && SIN[e]) { tab = SIN[e]; }
  else if (m && !m.t && SIN[e]) { tab = SIN[e]; obj = m.o; }
  else if (m) { m.t =(m.t || '').replace(/^#[0-9a-f]+#/, '').replace(/^Microsoft\.[\w.]+\./, ''); const id = m.id || n2id[m.t] || ''; if (REAL[m.t]) m.t += ' → datos en ' + REAL[m.t]; tab = m.t ? `${m.t}${id ? ' (' + id + ')' : ''}${m.tmp ? ' *temporal*' : ''}` : '¿?'; obj = m.o;   if (!id && /^(Company|User|Access Control|Aggregate Permission Set|Expanded Permission|Published Application|NAV App Tenant Operation|All Profile|Feature Key)$/.test(m.t)) tab += ' *(tabla de sistema)*'; } else miss.push(r + ' ' + e);
  md += `| ${e} | ${tab} | ${obj} |\n`; n++;
}
fs.writeFileSync(path.join(sp, 'api-tablas.md'), md);
console.log('filas', n, 'sin mapear', miss.length); console.log(miss.join('\n'));
