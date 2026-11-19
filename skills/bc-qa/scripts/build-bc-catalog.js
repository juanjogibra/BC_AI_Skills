// Genera catálogos de anticipación a partir del código AL y la traducción es-ES de la Base Application.
// Uso: node build-bc-catalog.js <carpeta extraída (src/ + Translations/)> <carpeta salida>
// Salida (TSV, buscar con Grep):
//   errores.tsv   -> texto ES | texto EN | objeto | etiqueta | fichero:línea | condición que lo dispara
//   obligatorios.tsv -> proceso (codeunit) | tabla | campo EN | campo ES | nº de TestField | fichero:línea
//   acciones.tsv  -> página ID | página | acción | caption ES | ruta de menú ES | pestaña promovida ES
const fs = require('fs'), path = require('path');
const [root, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const clean = s => (s || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/[\t\r\n]+/g, ' ').trim();

// 1. Traducciones: LookupHint -> {en, es}
const xlfFile = fs.readdirSync(path.join(root, 'Translations')).find(f => /es-ES\.xlf$/.test(f));
const xlf = fs.readFileSync(path.join(root, 'Translations', xlfFile), 'utf8');
const tr = new Map();
for (const m of xlf.matchAll(/<trans-unit [^>]*>([\s\S]*?)<\/trans-unit>/g)) {
  const b = m[1];
  const hint = /LookupHint=(.*?)\)<\/note>/.exec(b) || /LookupHint=([^)]*)\)/.exec(b);
  if (!hint) continue;
  tr.set(clean(hint[1]), { en: clean((/<source>([\s\S]*?)<\/source>/.exec(b) || [])[1]), es: clean((/<target[^>]*>([\s\S]*?)<\/target>/.exec(b) || [])[1]) });
}
const T = (k) => tr.get(k) || {};
const noAmp = s => (s || '').replace(/&(?=\S)/g, '');
console.log('traducciones', tr.size);

// 2. Índice de objetos AL
const objs = []; const byKey = new Map();
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  const p = path.join(d, f.name);
  if (f.isDirectory()) walk(p);
  else if (f.name.endsWith('.al')) {
    const txt = fs.readFileSync(p, 'utf8');
    const m = /^\s*(table|tableextension|page|pageextension|codeunit|report|query|xmlport|enum|enumextension)\s+(\d+)\s+("([^"]+)"|(\S+))/mi.exec(txt);
    if (!m) continue;
    const o = { type: m[1].toLowerCase(), id: m[2], name: m[4] || m[5], file: p, rel: path.relative(root, p).replace(/\\/g, '/'), lines: txt.split(/\r?\n/) };
    objs.push(o); byKey.set(o.type + '|' + o.name, o);
  } } })(path.join(root, 'src'));
console.log('objetos', objs.length);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// 3. Errores y confirmaciones con su condición
// por objeto: identificador -> primera línea donde se usa dentro de Error( / Confirm( / FieldError( / ErrorInfo
const usos = new Map();
const usosDe = (o) => { if (usos.has(o)) return usos.get(o); const u = new Map();
  o.lines.forEach((l, i) => { if (/:\s*Label\b/.test(l)) return; const win = l + ' ' + (o.lines[i + 1] || '');
    if (!/\b(Error|Confirm|FieldError|ErrorInfo\.Create|ConfirmManagement\.\w+|StrMenu)\s*\(/i.test(win) && !/Message\s*:=/.test(l)) return;
    for (const id of l.match(/\b[A-Za-z_]\w*\b/g) || []) if (!u.has(id)) u.set(id, i); });
  usos.set(o, u); return u; };
const errRows = [];
for (const [hint, v] of tr) {
  const m = /^(Codeunit|Table|Page|Report|TableExtension|PageExtension) (.+) - NamedType (\w+)$/.exec(hint);
  if (!m) continue;
  const o = byKey.get(m[1].toLowerCase() + '|' + m[2]);
  const porNombre = /(Err|Error|Qst)$/i.test(m[3]);
  const u = o ? usosDe(o) : null;
  if (!porNombre && !(u && u.has(m[3]))) continue;
  let loc = '', cond = '';
  if (o) {
    const re = new RegExp('\\b' + m[3] + '\\b');
    const i = u.has(m[3]) ? u.get(m[3]) : o.lines.findIndex(l => re.test(l) && !/:\s*Label\b/.test(l));
    if (i >= 0) {
      loc = o.rel + ':' + (i + 1);
      for (let k = i; k >= Math.max(0, i - 4); k--) { const l = o.lines[k].trim(); if (/^(if|else if|until|while|case)\b/i.test(l) || /\bthen\b/i.test(l)) { cond = l; break; } }
      if (!cond) cond = o.lines[i].trim();
    }
  }
  errRows.push([v.es, v.en, m[1] + ' ' + m[2], m[3], loc, cond.slice(0, 200)]);
}
fs.writeFileSync(path.join(out, 'errores.tsv'), 'ES\tEN\tObjeto\tEtiqueta\tFichero\tCondición\n' + errRows.map(r => r.join('\t')).join('\n'));
console.log('errores', errRows.length);

// 4. Campos obligatorios (TestField) en los procesos de registro y lanzamiento
const procesos = /^(Sales-Post|Purch\.-Post|Item Jnl\.-Post Line|Gen\. Jnl\.-Post Line|Gen\. Jnl\.-Check Line|Item Jnl\.-Check Line|Whse\.-Post Shipment|Whse\.-Post Receipt|Whse\.-Activity-Post|TransferOrder-Post Shipment|TransferOrder-Post Receipt|FA Jnl\.-Post Line|FA Jnl\.-Check Line|Release Sales Document|Release Purchase Document|Sales-Post Prepayments|Purchase-Post Prepayments|Assembly-Post|Release Transfer Document|Whse\. Jnl\.-Register Line|Reservation Management|Sales Header|Purchase Header|Sales Line|Purchase Line)$/;
const reqRows = [];
for (const o of objs.filter(o => (o.type === 'codeunit' || o.type === 'table') && procesos.test(o.name))) {
  const vars = {};
  for (const l of o.lines) for (const m of l.matchAll(/(\w+)\s*:\s*Record\s+"?([^";)]+?)"?\s*[;)]/g)) vars[m[1]] = m[2].trim();
  if (o.type === 'table') vars['Rec'] = o.name;
  const agg = new Map();
  o.lines.forEach((l, i) => { for (const m of l.matchAll(/(?:(\w+)\.)?TestField\(\s*("([^"]+)"|(\w+))/g)) {
    const tbl = m[1] ? vars[m[1]] : o.name; const fld = m[3] || m[4]; if (!tbl) continue;
    const k = tbl + '|' + fld; if (!agg.has(k)) agg.set(k, { n: 0, line: i + 1 }); agg.get(k).n++; } });
  for (const [k, v] of agg) { const [tbl, fld] = k.split('|'); reqRows.push([o.name, tbl, fld, T(`Table ${tbl} - Field ${fld} - Property Caption`).es || '', v.n, o.rel + ':' + v.line]); }
}
fs.writeFileSync(path.join(out, 'obligatorios.tsv'), 'Proceso\tTabla\tCampo EN\tCampo ES\tTestField\tFichero\n' + reqRows.map(r => r.join('\t')).join('\n'));
console.log('obligatorios', reqRows.length);

// 5. Acciones por página: ruta de menú y pestaña promovida
const actRows = [];
for (const o of objs.filter(o => o.type === 'page' || o.type === 'pageextension')) {
  const pname = o.type === 'page' ? o.name : (/extends\s+"?([^"{]+?)"?\s*$/m.exec(o.lines.join('\n')) || [])[1] || o.name;
  const stack = []; let pending = null; const acts = {}; const promoted = {};
  for (const raw of o.lines) {
    const l = raw.trim();
    const m = /^(area|group|action|actionref|separator)\s*\(\s*([^;)]+?)\s*(?:;\s*([^)]+?)\s*)?\)/i.exec(l);
    if (m) pending = { kind: m[1].toLowerCase(), name: m[2].replace(/"/g, ''), target: (m[3] || '').replace(/"/g, '') };
    for (const ch of l) {
      if (ch === '{') { stack.push(pending || { kind: 'block' }); if (pending && pending.kind === 'action') acts[pending.name] = stack.filter(s => s.kind === 'area' || s.kind === 'group').map(s => s.name); if (pending && pending.kind === 'actionref') { const grp = [...stack].reverse().find(s => s.kind === 'group'); if (grp) promoted[pending.target] = grp.name; } pending = null; }
      else if (ch === '}') stack.pop();
    }
    if (pending && /;\s*$/.test(l) && pending.kind === 'actionref') { const grp = [...stack].reverse().find(s => s.kind === 'group'); if (grp) promoted[pending.target] = grp.name; pending = null; }
  }
  const P = o.type === 'page' ? 'Page' : 'PageExtension';
  const gcap = g => g === 'Category_Process' ? 'Inicio' : noAmp(T(`${P} ${o.name} - Action ${g} - Property Caption`).es || T(`${P} ${o.name} - Group ${g} - Property Caption`).es || ({ Category_Process: 'Inicio', Category_New: 'Nuevo', Category_Report: 'Informe' }[g]) || g);
  for (const [a, grp] of Object.entries(acts)) {
    const es = noAmp(T(`${P} ${o.name} - Action ${a} - Property Caption`).es || '');
    actRows.push([o.type === 'page' ? o.id : 'ext ' + o.id, pname, a, es, grp.filter(g => !/^(Processing|Navigation|Reporting|Creation|Promoted)$/i.test(g)).map(gcap).join(' > '), promoted[a] ? gcap(promoted[a]) : '']);
  }
}
fs.writeFileSync(path.join(out, 'acciones.tsv'), 'PáginaID\tPágina\tAcción\tCaption ES\tMenú\tPestaña promovida\n' + actRows.map(r => r.join('\t')).join('\n'));
console.log('acciones', actRows.length);
