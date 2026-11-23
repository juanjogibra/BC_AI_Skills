// Scans AL projects against BC 29.1 symbol index for obsolete/removed usage + other SaaS-readiness checks
const fs = require('fs'), path = require('path');
const idx = JSON.parse(fs.readFileSync(path.join(__dirname, 'index.json'), 'utf8'));
const L = s => (s || '').toLowerCase();
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8').replace(/^﻿/, ''));
const ROOT = process.argv[2];
const TYPEMAP = { record: 'table', database: 'table', table: 'table', codeunit: 'codeunit', page: 'page', report: 'report', query: 'query', xmlport: 'xmlport', enum: 'enum', interface: 'interface' };

function strip(src) { // remove comments, keep strings
  let o = '', i = 0, n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === "'") { let j = i + 1; while (j < n && !(src[j] === "'" && src[j + 1] !== "'")) { if (src[j] === "'" ) j++; j++; } o += src.slice(i, j + 1); i = j + 1; }
    else if (c === '"') { let j = src.indexOf('"', i + 1); if (j < 0) j = n; o += src.slice(i, j + 1); i = j + 1; }
    else if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; }
    else if (c === '/' && d === '*') { const j = src.indexOf('*/', i + 2); i = j < 0 ? n : j + 2; }
    else { o += c; i++; }
  }
  return o;
}
const nm = s => { s = s.trim(); const m = s.match(/"([^"]+)"\s*$/) || s.match(/([\w]+)\s*$/); return m ? m[1] : s; };
function resolve(type, name) {
  if (/^\d+$/.test(name)) { const k = idx.byId[type + '|' + name]; return k ? idx.obj[k] : null; }
  return idx.obj[type + '|' + L(name)] || null;
}
function walkAL(dir, out, isRoot) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/^(\.alpackages|\.git|\.vscode|node_modules|\.snapshots|bin|obj|\.output)$/i.test(e.name)) continue;
      if (fs.existsSync(path.join(p, 'app.json'))) continue; // nested project
      walkAL(p, out, false);
    } else if (/\.al$/i.test(e.name)) out.push(p);
  }
}
const TRIGGER_EV = /^On(Before|After)(Insert|Modify|Delete|Rename|Validate|GetRecord|NewRecord|OpenPage|ClosePage|Action|AfterGetCurrRecord|GetCurrRecord|QueryClosePage|Lookup)?(Event)?$/i;

const results = [];
// collect all object names defined across all scanned projects (to tell own/3rd party from MS)
const ownNames = new Set(); const ownCtl = new Set();
const fileCache = {};
for (const pr of projects) {
  const files = []; walkAL(path.join(ROOT, pr.Dir), files, true);
  pr.files = files;
  for (const f of files) {
    const t = strip(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
    fileCache[f] = t;
    for (const m of t.matchAll(/^\s*(table|codeunit|page|report|query|xmlport|enum|interface)\s+(\d+\s+)?("[^"]+"|\w+)/gim)) ownNames.add(m[1].toLowerCase() + '|' + L(nm(m[3])));
    for (const m of t.matchAll(/\b(field|group|action|part|actionref|systempart|usercontrol|label|repeater|cuegroup|grid|fixed|separator|dataitem|column)\s*\(\s*(?:\d+\s*;\s*)?("[^"]+"|\w+)/gi)) ownCtl.add(L(nm(m[2])));
  }
}
for (const pr of projects) {
  const R = { project: pr.Dir, name: pr.Name, runtime: pr.Runtime, app: pr.App, target: pr.Target, alFiles: pr.files.length, issues: [] };
  const add = (cat, sev, msg, file) => R.issues.push({ cat, sev, msg, file: path.relative(path.join(ROOT, pr.Dir), file || '') });
  // app.json checks
  let aj = {}; try { aj = JSON.parse(fs.readFileSync(path.join(ROOT, pr.Dir, 'app.json'), 'utf8').replace(/^﻿/, '')); } catch (e) { }
  const feats = (aj.features || []).map(L);
  R.noImplicitWith = feats.includes('noimplicitwith');
  R.translation = feats.includes('translationfile');
  R.deps = (aj.dependencies || []).map(d => `${d.publisher}/${d.name} ${d.version || d.appVersion || ''}`);
  if (fs.readdirSync(path.join(ROOT, pr.Dir)).some(f => /permission.*\.xml$/i.test(f))) add('permisos', 2, 'Permisos en XML (permissions.xml): hay que migrarlos a objetos permissionset AL');
  let hasPermSet = false, implicitWithHits = 0, dotnet = 0, onprem = 0, rdlcProp = 0, wordProp = 0;
  const seen = new Set();
  const once = (k, fn) => { if (!seen.has(k)) { seen.add(k); fn(); } };
  for (const f of pr.files) {
    const t = fileCache[f];
    if (/^\s*permissionset\s+\d+/im.test(t)) hasPermSet = true;
    if (/\bDotNet\b/.test(t) && /:\s*DotNet\b|dotnet\s*\{/i.test(t)) { dotnet++; add('cloud', 3, 'Uso de DotNet (no permitido en SaaS)', f); }
    if (/Scope\s*=\s*'OnPrem'/i.test(t)) onprem++;
    if (/\bRDLCLayout\s*=/i.test(t)) rdlcProp++;
    if (/\bWordLayout\s*=/i.test(t)) wordProp++;
    // variable types
    const vars = {};
    for (const m of t.matchAll(/(\w+|"[^"]+")\s*:\s*(Record|Codeunit|Page|Report|Query|XmlPort|Enum|Interface)\s+((?:[\w]+\.)*(?:"[^"]+"|\w+))/gi)) {
      const ty = TYPEMAP[L(m[2])], on = nm(m[3]);
      vars[L(nm(m[1]))] = ty + '|' + on;
      const o = resolve(ty, on);
      if (o && o.obs) once('o' + ty + on, () => add('obsoleto', o.obs.state === 'Removed' ? 5 : 4, `${ty} "${o.name}" ${o.obs.state} (tag ${o.obs.tag}): ${o.obs.reason}`, f));
      else if (!o && !ownNames.has(ty + '|' + L(on)) && !/^\d+$/.test(on)) once('u' + ty + on, () => add('desconocido', 1, `${ty} "${on}" no existe en 29.1 ni en los proyectos (¿dependencia de terceros o eliminado?)`, f));
    }
    // object type literals
    for (const m of t.matchAll(/\b(Database|Codeunit|Page|Report|Query|XmlPort|Enum)::((?:[\w]+\.)*(?:"[^"]+"|\w+))/gi)) {
      const ty = TYPEMAP[L(m[1])], on = nm(m[2]);
      const o = resolve(ty, on);
      if (o && o.obs) once('o' + ty + on, () => add('obsoleto', o.obs.state === 'Removed' ? 5 : 4, `${ty} "${o.name}" ${o.obs.state} (tag ${o.obs.tag}): ${o.obs.reason}`, f));
    }
    // extends
    let rec = null, page = null;
    const ext = t.match(/^\s*(tableextension|pageextension|reportextension|enumextension)\s+\d+\s+("[^"]+"|\w+)\s+extends\s+((?:[\w]+\.)*(?:"[^"]+"|\w+))/im);
    if (ext) {
      const kind = { tableextension: 'table', pageextension: 'page', reportextension: 'report', enumextension: 'enum' }[L(ext[1])];
      const base = resolve(kind, nm(ext[3]));
      if (base) {
        if (base.obs) add('obsoleto', 4, `${ext[1]} sobre ${kind} "${base.name}" ${base.obs.state} (tag ${base.obs.tag})`, f);
        if (kind === 'table') rec = base;
        if (kind === 'page') { page = base; rec = base.sourceTable ? idx.obj[base.sourceTable] : null; }
        if (kind === 'page' || kind === 'report') {
          for (const m of t.matchAll(/\b(addafter|addbefore|addfirst|addlast|modify|moveafter|movebefore|movefirst|movelast)\s*\(\s*("[^"]+"|\w+)/gi)) {
            const c = L(nm(m[2]));
            if (/^(content|processing|reporting|creation|navigation|promoted|factboxes|rolecenter|embedding|sections)$/.test(c)) continue;
            if (/^(true|false)$/.test(c) || ownCtl.has(c)) continue;
            if (base.controls[c] === undefined) { if (kind === 'page') once('mc' + c, () => add('ancla', 5, `${ext[1]}: el control/acción "${nm(m[2])}" no existe en ${kind} "${base.name}" 29.1 (error de compilación)`, f)); }
            else if (base.controls[c]) once('oc' + c, () => add('obsoleto', base.controls[c].state === 'Removed' ? 5 : 3, `${ext[1]}: control/acción "${nm(m[2])}" de "${base.name}" ${base.controls[c].state} (tag ${base.controls[c].tag})`, f));
          }
        }
        if (kind === 'table') for (const m of t.matchAll(/\bmodify\s*\(\s*("[^"]+"|\w+)/gi)) { const fo = base.fields[L(nm(m[1]))]; if (fo) add('obsoleto', 4, `tableextension modifica el campo obsoleto "${nm(m[1])}" (${fo.state} ${fo.tag})`, f); }
      } else if (!ownNames.has(kind + '|' + L(nm(ext[3])))) add('desconocido', 1, `${ext[1]} extiende "${nm(ext[3])}" que no está en 29.1 (¿app de terceros?)`, f);
    }
    // report dataitems typed vars
    for (const m of t.matchAll(/dataitem\s*\(\s*("[^"]+"|\w+)\s*;\s*((?:[\w]+\.)*(?:"[^"]+"|\w+))/gi)) vars[L(nm(m[1]))] = 'table|' + nm(m[2]);
    if (rec) { vars['rec'] = 'table|' + rec.name; vars['xrec'] = 'table|' + rec.name; }
    // event subscribers
    for (const m of t.matchAll(/\[EventSubscriber\s*\(\s*ObjectType::(\w+)\s*,\s*(\w+)::((?:[\w]+\.)*(?:"[^"]+"|\w+))\s*,\s*'([^']*)'\s*,\s*'([^']*)'/gi)) {
      const ty = TYPEMAP[L(m[1])] || L(m[1]), on = nm(m[3]), ev = m[4], el = m[5];
      const o = resolve(ty, on);
      if (!o) { if (!ownNames.has(ty + '|' + L(on))) once('us' + on, () => add('desconocido', 1, `Suscripción a ${ty} "${on}" no encontrado en 29.1 (¿terceros/eliminado?)`, f)); continue; }
      if (o.obs) once('o' + ty + on, () => add('obsoleto', 4, `Suscripción a ${ty} "${o.name}" ${o.obs.state} (tag ${o.obs.tag})`, f));
      if (TRIGGER_EV.test(ev) || (!o.methods[L(ev)] && /^On\w*Event$/i.test(ev))) {
        if (el && ty === 'table') { const fo0 = o.fields[L(el)]; const fo = fo0 && fo0.state === 'Moved' ? false : fo0; if (fo === undefined && ownCtl.has(L(el))) {} else if (fo === undefined) add('evento', 5, `Suscripción ${ev} a campo "${el}" de "${o.name}" que no existe en 29.1`, f); else if (fo) add('obsoleto', 4, `Suscripción ${ev} a campo obsoleto "${el}" de "${o.name}" (${fo.state} ${fo.tag})`, f); }
        continue;
      }
      const me = o.methods[L(ev)];
      if (!me) add('evento', 5, `Evento '${ev}' de ${ty} "${o.name}" NO existe en 29.1 (error de compilación)`, f);
      else if (me.obs) add('evento', 4, `Evento '${ev}' de ${ty} "${o.name}" obsoleto (tag ${me.obs.tag}): ${me.obs.reason}`, f);
    }
    // method calls / field usage on typed vars
    for (const m of t.matchAll(/(\b\w+|"[^"]+")\.("[^"]+"|\w+)(\s*\()?/g)) {
      const v = vars[L(nm(m[1]))]; if (!v) continue;
      const [ty, on] = [v.split('|')[0], v.split('|').slice(1).join('|')];
      const o = resolve(ty, on); if (!o) continue;
      const mem = L(nm(m[2]));
      const me = o.methods[mem];
      if (me && me.obs) once('m' + o.name + mem, () => add('metodo', me.nobs === me.n ? 4 : 2, `${o.name}.${nm(m[2])}() obsoleto${me.nobs < me.n ? ' (alguna sobrecarga)' : ''} (tag ${me.obs.tag}): ${me.obs.reason}`, f));
      if (ty === 'table') { const fo = o.fields[mem]; if (fo && fo.state !== 'Moved') once('f' + o.name + mem, () => add('campo', fo.state === 'Removed' ? 5 : 4, `Campo "${o.name}"."${nm(m[2])}" ${fo.state} (tag ${fo.tag}): ${fo.reason}`, f)); }
    }
    // field args in SetRange/Validate/etc. on typed vars
    for (const m of t.matchAll(/(\b\w+|"[^"]+")\.(SetRange|SetFilter|Validate|TestField|CalcFields|CalcSums|FieldNo|SetCurrentKey|FieldCaption|FieldError|GetFilter|CopyFilter)\s*\(\s*("[^"]+"|\w+)/gi)) {
      const v = vars[L(nm(m[1]))]; if (!v || !v.startsWith('table|')) continue;
      const o = resolve('table', v.slice(6)); if (!o) continue;
      const fo = o.fields[L(nm(m[3]))]; if (fo && fo.state !== 'Moved') once('f' + o.name + L(nm(m[3])), () => add('campo', fo.state === 'Removed' ? 5 : 4, `Campo "${o.name}"."${nm(m[3])}" ${fo.state} (tag ${fo.tag}): ${fo.reason}`, f));
    }
    // unqualified quoted fields in table/page extensions (implicit Rec)
    if (rec) for (const m of t.matchAll(/"([^"]+)"/g)) { const fo = rec.fields[L(m[1])]; if (fo && fo.state !== 'Moved') once('f' + rec.name + L(m[1]), () => add('campo', fo.state === 'Removed' ? 5 : 4, `Campo "${rec.name}"."${m[1]}" ${fo.state} (tag ${fo.tag}): ${fo.reason}`, f)); }
    // enum values
    for (const m of t.matchAll(/((?:[\w]+\.)*(?:"[^"]+"|\w+))::("[^"]+"|\w+)/g)) {
      const o = idx.obj['enum|' + L(nm(m[1]))]; if (!o) continue;
      const vo = o.values[L(nm(m[2]))]; if (vo) once('e' + o.name + m[2], () => add('enum', 3, `Valor de enum "${o.name}"::${nm(m[2])} ${vo.state} (tag ${vo.tag})`, f));
    }
    // implicit with heuristic: codeunit/report code calling record methods without var (only matters when NoImplicitWith off)
    if (!R.noImplicitWith && /^\s*(pageextension|page|tableextension|table|report)\b/im.test(t) && /\btrigger\s+On|procedure\s/i.test(t)) {
      const body = t.replace(/'[^']*'/g, "''");
      const hits = body.match(/(^|[\s;(=])(SetRange|SetFilter|FindFirst|FindSet|Modify|Insert|CalcFields|TestField|Validate|Get)\s*\(/gm);
      if (hits) implicitWithHits += hits.length;
    }
  }
  if (!hasPermSet && pr.files.length) add('permisos', 1, 'Sin objeto permissionset en el proyecto');
  if (!R.noImplicitWith && implicitWithHits) add('implicitwith', 2, `Sin feature NoImplicitWith y ~${implicitWithHits} llamadas implícitas a Rec (with implícito, obsoleto)`);
  if (onprem) add('cloud', 3, `${onprem} fichero(s) con Scope = 'OnPrem'`);
  if (rdlcProp || wordProp) add('layout', 1, `Layouts con propiedades antiguas RDLCLayout/WordLayout (${rdlcProp + wordProp} ficheros) en lugar de rendering`);
  results.push(R);
}
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 1));
console.log('ok', results.length);
