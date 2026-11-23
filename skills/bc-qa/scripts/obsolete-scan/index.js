// Builds an index of BC 29.1 symbols: objects, fields, methods, enum values, page controls with obsolete info
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'sym');
const idx = { obj: {}, byId: {} }; // key: type|lname
const L = s => (s || '').toLowerCase();
function obsProps(props) {
  if (!props) return null;
  const g = n => (props.find(p => p.Name === n) || {}).Value;
  const st = g('ObsoleteState');
  if (!st || st === 'No') return null;
  return { state: st, tag: g('ObsoleteTag') || '', reason: (g('ObsoleteReason') || '').slice(0, 200) };
}
function obsAttr(attrs) {
  if (!attrs) return null;
  const a = attrs.find(x => x.Name === 'Obsolete');
  if (!a) return null;
  const args = (a.Arguments || []).map(x => x.Value);
  return { state: 'Pending', tag: args[1] || '', reason: (args[0] || '').slice(0, 200) };
}
const TYPES = { Tables: 'table', Codeunits: 'codeunit', Pages: 'page', Reports: 'report', XmlPorts: 'xmlport', Queries: 'query', EnumTypes: 'enum', Interfaces: 'interface', ControlAddIns: 'controladdin', PermissionSets: 'permissionset' };
function walkControls(ctrls, out) {
  for (const c of ctrls || []) {
    if (c.Name) out[L(c.Name)] = obsProps(c.Properties) || out[L(c.Name)] || false;
    walkControls(c.Controls, out); walkControls(c.Actions, out);
  }
}
function addObj(kind, o, app) {
  const t = TYPES[kind]; if (!t) return;
  const e = { type: t, id: o.Id, name: o.Name, app, obs: obsProps(o.Properties), fields: {}, methods: {}, values: {}, controls: {}, sourceTable: null };
  for (const f of o.Fields || []) e.fields[L(f.Name)] = obsProps(f.Properties) || false;
  for (const m of o.Methods || []) {
    const isEv = (m.Attributes || []).some(a => /Event$/.test(a.Name));
    const ob = obsAttr(m.Attributes);
    const k = L(m.Name);
    const prev = e.methods[k];
    // overloads: keep "all obsolete" vs "some obsolete"
    if (!prev) e.methods[k] = { ev: isEv, obs: ob, n: 1, nobs: ob ? 1 : 0 };
    else { prev.n++; if (ob) { prev.nobs++; prev.obs = prev.obs || ob; } prev.ev = prev.ev || isEv; }
  }
  for (const v of o.Values || []) e.values[L(v.Name)] = obsProps(v.Properties) || false;
  if (t === 'page') {
    const st = (o.Properties || []).find(p => p.Name === 'SourceTable');
    if (st) e.sourceTable = st.Value;
    walkControls(o.Controls, e.controls); walkControls(o.Actions, e.controls);
  }
  if (t === 'report') {
    // dataitems
    (function w(d) { for (const x of d || []) { e.controls[L(x.Name)] = false; w(x.DataItems); } })(o.DataItems);
  }
  idx.obj[t + '|' + L(o.Name)] = e;
  idx.byId[t + '|' + o.Id] = t + '|' + L(o.Name);
}
const exts = [];
function walk(node, app) {
  for (const k of Object.keys(TYPES)) for (const o of node[k] || []) addObj(k, o, app);
  for (const k of ['TableExtensions', 'PageExtensions', 'EnumExtensionTypes', 'ReportExtensions']) for (const o of node[k] || []) exts.push([k, o]);
  for (const n of node.Namespaces || []) walk(n, app);
}
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, ''));
  walk(j, j.Name);
}
for (const [k, o] of exts) {
  const t = { TableExtensions: 'table', PageExtensions: 'page', EnumExtensionTypes: 'enum', ReportExtensions: 'report' }[k];
  let tn = String(o.TargetObject || '').replace(/^#[^#]*#/, ''); const m = tn.match(/"?([^".]+)"?$/); tn = m ? m[1] : tn;
  const e = idx.obj[t + '|' + L(tn)]; if (!e) continue;
  for (const f of o.Fields || []) if (!(L(f.Name) in e.fields)) e.fields[L(f.Name)] = obsProps(f.Properties) || false;
  for (const mm of o.Methods || []) { const kk = L(mm.Name); if (!e.methods[kk]) e.methods[kk] = { ev: true, obs: obsAttr(mm.Attributes), n: 1, nobs: obsAttr(mm.Attributes) ? 1 : 0 }; }
  for (const v of o.Values || []) e.values[L(v.Name)] = obsProps(v.Properties) || false;
  (function wc(list) { for (const c of list || []) { if (c.Name && !(L(c.Name) in e.controls)) e.controls[L(c.Name)] = obsProps(c.Properties) || false; wc(c.Controls); wc(c.Actions); } })([].concat(o.Controls || [], o.Actions || [], o.ControlChanges || [], o.ActionChanges || []));
  (function wd(d) { for (const x of d || []) { e.controls[L(x.Name)] = false; wd(x.DataItems); } })(o.DataItems);
}
// sourceTable may be a qualified name or id
for (const e of Object.values(idx.obj)) if (e.sourceTable) {
  let s = e.sourceTable; const m = s.match(/"?([^".]+)"?$/); s = m ? m[1] : s;
  e.sourceTable = /^\d+$/.test(s) ? (idx.byId['table|' + s] || null) : 'table|' + L(s);
}
fs.writeFileSync(path.join(__dirname, 'index.json'), JSON.stringify(idx));
let c = { objObs: 0, fieldObs: 0, methObs: 0, valObs: 0 };
for (const e of Object.values(idx.obj)) {
  if (e.obs) c.objObs++;
  c.fieldObs += Object.values(e.fields).filter(Boolean).length;
  c.methObs += Object.values(e.methods).filter(m => m.obs).length;
  c.valObs += Object.values(e.values).filter(Boolean).length;
}
console.log(Object.keys(idx.obj).length, 'objects', c);
