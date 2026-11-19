async (page) => {
const QA=(page,BASE)=>{
const fr=page.frameLocator('iframe').first();
const wait=ms=>page.waitForTimeout(ms);
const L={
fr,wait,
dialogs:()=>page.evaluate(()=>[...document.querySelector('iframe').contentDocument.querySelectorAll('[role=dialog]')]
.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,300)).filter(t=>t&&!/^Acerca de/.test(t))).catch(()=>[]),
ensureVisible:async ()=>{const st=()=>page.evaluate(()=>document.visibilityState).catch(()=>'?');if(await st()==='visible')return 'visible';
await page.bringToFront().catch(()=>{});
try{const s=await page.context().newCDPSession(page);const {windowId}=await s.send('Browser.getWindowForTarget');await s.send('Browser.setWindowBounds',{windowId,bounds:{windowState:'normal'}});await s.send('Browser.setWindowBounds',{windowId,bounds:{windowState:'maximized'}});await s.send('Page.bringToFront').catch(()=>{});await s.detach().catch(()=>{});}catch(e){}
for(let i=0;i<10;i++){if(await st()==='visible')return 'restaurada';await wait(300);}return 'OCULTA';},
clk:async (l,t=3000)=>{if(await L.ensureVisible()==='OCULTA')return null;
try{await l.click({timeout:t});return 'click';}catch(e){}try{await l.click({force:true,timeout:t});return 'force';}catch(e){}try{await l.dispatchEvent('click',{},{timeout:t});return 'dispatch';}catch(e){}return null;},
topDialog:()=>fr.getByRole('dialog').filter({hasNot:fr.getByRole('dialog',{name:/^Acerca de/})}).last(),
answer:async (names)=>{const ds=fr.getByRole('dialog');
const top=async ()=>{const n=await ds.count();return n?ds.nth(n-1):null;};
for(let k=0;k<3;k++){const t=await top();if(!t)break;const txt=await t.innerText().catch(()=>'');if(!/modal abierto en otra ventana/i.test(txt))break;const ok=t.getByRole('button',{name:'Aceptar',exact:true});if(!(await ok.count())||!(await L.clk(ok.first())))break;await wait(800);}
const n=await ds.count();
for(let i=n-1;i>=0;i--){const d=ds.nth(i);if(/^Acerca de/.test(await d.getAttribute('aria-label').catch(()=>'')||''))continue;
for(const nm of names){const b=d.getByRole('button',{name:nm,exact:true}).or(d.getByRole('menuitem',{name:nm,exact:true}));if(await b.count()){const r=await L.clk(b.last());if(!r)return null;await wait(1500);return nm;}}}
return null;},
set:async (scope,re,v)=>{const el=scope.getByRole('combobox',{name:re}).or(scope.getByRole('textbox',{name:re})).first();await el.fill(String(v));await el.press('Tab');await wait(2000);return el.inputValue().catch(()=>'?');},
expandLines:async ()=>{const visible=()=>L.lines().isVisible().catch(()=>false);
if(await visible())return 'ya visible';
await page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;const b=[...d.querySelectorAll('[aria-expanded="false"]')].find(b=>/^\s*Líneas\s*$/.test(b.innerText));if(b)b.click();}).catch(()=>{});
for(let i=0;i<12;i++){await wait(400);if(await visible())return 'expandida';}return 'NO VISIBLE';},
lines:()=>fr.getByRole('grid',{name:/Líneas|Lines/}).first(),
columns:async (grid)=>(await grid.getByRole('columnheader').allInnerTexts()).map(t=>t.replace(/\s+/g,' ').trim()).filter(Boolean),
noUnload:()=>page.evaluate(()=>{window.onbeforeunload=null;try{document.querySelector('iframe').contentWindow.onbeforeunload=null;}catch(e){}}).catch(()=>{}),
open:async (pageId,extra='')=>{await L.ensureVisible();await L.noUnload();for(let t=0;t<3;t++){try{await page.goto(`${BASE}&page=${pageId}${extra}`);break;}catch(e){await wait(2000);}}await wait(1500);for(let i=0;i<40;i++){const ok=await page.evaluate(()=>{const d=document.querySelector('iframe')?.contentDocument;return !!(d&&d.querySelector('form')&&document.title&&document.title !=='Dynamics 365 Business Central');}).catch(()=>false);if(ok)break;await wait(300);}await wait(800);await L.tips();},
tips:async ()=>{for(let i=0;i<3;i++){const t=fr.getByRole('dialog',{name:/^Acerca de/}).first();if(!(await t.count()))break;await L.clk(t.getByRole('button',{name:'Descartar'}));await wait(600);}},
acts:async (re,tabs=['Inicio','Preparar','Recibo','Pedido','Acciones','Línea','Procesar','Registrar'])=>{const out=new Set();const grab=()=>page.evaluate((src)=>{const rx=new RegExp(src,'i');return [...document.querySelector('iframe').contentDocument.querySelectorAll('[role=menuitem],button[title]')].map(e=>(e.getAttribute('aria-label')||e.innerText||e.getAttribute('title')||'').trim()).filter(t=>t&&t.length<60&&rx.test(t));},re.source);(await grab()).forEach(x=>out.add(x));for(const tb of tabs){const m=fr.getByRole('menuitem',{name:tb,exact:true}).first();if(await m.count()){await L.clk(m,1500);await wait(500);(await grab()).forEach(x=>out.add(x));}}return [...out];},
read:async (pageId,filter,max=15)=>{
await L.open(pageId,filter?'&filter='+encodeURIComponent(filter):'');
for(let i=0;i<20;i++){
const r=await page.evaluate(()=>{const d=document.querySelector('iframe')?.contentDocument;if(!d)return null;const g=d.querySelector('[role=grid]');if(!g)return null;
const t=g.innerText;if(/Cargando|Recuperando/.test(t)&&!/nada que mostrar/.test(t))return null;if(/nada que mostrar/.test(t))return 'VACÍO';
const head=[...g.querySelectorAll('thead th')].map(h=>h.innerText.replace(/\s+/g,' ').trim());
const rows=[...g.querySelectorAll('tbody tr')].filter(x=>x.innerText.trim()).map(x=>[...x.querySelectorAll('td')].map((td,i)=>[head[i],td.innerText.replace(/\s+/g,' ').trim()]).filter(([h,v])=>h&&v&&!/^0,00$/.test(v)).map(([h,v])=>`${h}=${v}`).join('|'));
return rows.length?rows:null;}).catch(()=>null);
if(r&&Array.isArray(r)&&r.length>max){const n=r.length;r.length=max;r.push('... ('+n+' filas, recortado a '+max+'; filtrar más)');}
if(r)return r;await wait(1000);
}
return 'SIN LEER';
},
menu:async (name)=>{const ex=typeof name==='string';const dlgs=fr.getByRole('dialog');let m=null;
const cand=(s)=>{let c=s.getByRole('menuitem',{name,exact:ex}).or(s.getByRole('button',{name,exact:ex}));if(ex)c=c.or(s.locator('button[title="'+name.replace(/"/g,'\\"')+'"]'));return c;};
if(await dlgs.count()){const c=cand(dlgs.last());if(await c.count())m=c.first();}
if(!m)m=cand(fr).first();
const r=await L.clk(m);if(!r)throw new Error('menu no pulsable: '+name);await wait(1500);return r;},
menuPath:async (path)=>{const via=[];for(const p of path)via.push(await L.menu(p));return via;},
post:async (option,act=/^Registrar(...)?$/)=>{
const pre=await L.notes();if(!L.force&&pre.some(t=>/disponible|insuficiente|no está en inventario|bloquead|crédito|vencid|saldo/i.test(t)))return {abortado:'NOTIFICACIÓN CRÍTICA ANTES DE REGISTRAR',notificaciones:pre};
await L.clk(fr.getByRole('menuitem',{name:'Inicio',exact:true}).first(),1500);await wait(600);
if(!(await L.clk(fr.getByRole('menuitem',{name:act}).first())))return {abortado:'ACCIÓN DE REGISTRO NO PULSABLE (¿deshabilitada?)'};await wait(2500);
if(option){await L.clk(fr.getByRole('dialog').getByText(new RegExp('^'+option+'$')).first());await wait(800);await L.answer(['Aceptar']);}
const log=[];
for(let i=0;i<6;i++){await wait(3000);const ds=await L.dialogs();if(!ds.length){if(i>1)break;continue;}const t=ds[ds.length - 1];log.push(t.slice(0,200));
if(/abrir|registr.*n[úu]mero|se registr/i.test(t)){await L.answer(['No','Aceptar']);break;}
if(/¿/.test(t)){if(log.length>1&&log[log.length-2]===log[log.length-1]){await page.keyboard.press('Enter');await wait(1500);const again=(await L.dialogs()).slice(-1)[0];if(again&&again.slice(0,200)===log[log.length-1])return {abortado:'DIÁLOGO DE CONFIRMACIÓN NO SE CIERRA',dialogos:log};continue;}if(!(await L.answer(['Sí'])))return {abortado:'NO SE PUDO RESPONDER Sí',dialogos:log};continue;}
await L.answer(['Aceptar']);}
return {dialogos:log,error700:await L.err700(),titulo:await page.title()};
},
err700:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;const g=[...d.querySelectorAll('[role=grid]')].find(x=>/Acción recomendada/.test(x.innerText));return g?[...g.querySelectorAll('tbody tr')].map(x=>x.innerText.replace(/\s+/g,' ').trim()).filter(t=>t.length>4):null;}).catch(()=>null),
tracking:async (fields)=>{
await L.clk(fr.getByRole('menuitem',{name:'Línea',exact:true}).last());await wait(800);
await L.clk(fr.getByText('Información relacionada',{exact:true}).last(),1500);await wait(800);
await L.clk(fr.getByText('Líns. seguim. prod.',{exact:true}).first());await wait(5000);
const dlg=fr.getByRole('dialog',{name:/Líns\. seguim\. prod\./}).first();
for(const [re,v] of fields)await L.set(dlg,re,v);
await L.clk(dlg.getByRole('button',{name:'Cerrar',exact:true}));await wait(3000);
const d=await L.dialogs();await L.answer(['Sí','Aceptar']);return d;
},
errs:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;return [...new Set([...d.querySelectorAll('[class*=error],[class*=Error],[role=alert]')].map(e=>(e.getAttribute('title')||e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t.length>10&&!/Alt \+ I/.test(t)))].slice(0,3);}).catch(()=>[]),
pick:async (scope,re,label)=>{const s=scope.getByRole('combobox',{name:re}).first();await s.selectOption({label});await page.keyboard.press('Tab');await wait(1500);return s.evaluate(x=>x.options[x.selectedIndex].text).catch(()=>'?');},
fields:(re)=>page.evaluate((src)=>{const d=document.querySelector('iframe').contentDocument;const rx=new RegExp(src||'.','i');const nm=e=>e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')||'').split(' ').map(id=>d.getElementById(id)?.innerText||'').join(' ').trim();return [...new Set([...d.querySelectorAll('input,select,[role=combobox],[role=textbox]')].map(nm).filter(t=>t&&rx.test(t)))].slice(0,40);},re?re.source:''),
notes:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;const out=new Set();d.querySelectorAll('[class*=notification],[class*=Notification],[role=status],[role=alert]').forEach(e=>{const t=(e.innerText||'').replace(/\s+/g,' ').trim();if(t.length>15&&t.length<600)out.add(t);});return [...out].slice(0,5);}).catch(()=>[]),
readCard:async (pageId,filter,required=[])=>{
await L.open(pageId,'&mode=edit'+(filter?'&filter='+encodeURIComponent(filter):''));
const expand=()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;[...d.querySelectorAll('[aria-expanded="false"]')].forEach(b=>{const t=(b.innerText||'').trim();if(t&&t.length<40&&!/Más opciones|Inicio|Acciones|Preparar|Informe|Navegar|Línea|Compartir|Diseño|Administrar/.test(t))b.click();});[...d.querySelectorAll('button,[role=button]')].filter(b=>/^Mostrar más$/i.test((b.innerText||'').trim())).forEach(b=>b.click());}).catch(()=>{});
const leer=()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;const out={};const nm=e=>(e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')||'').split(' ').map(i=>d.getElementById(i)?.innerText||'').join(' ')).replace(/\s+/g,' ').trim();
d.querySelectorAll('input,select,[role=switch],[role=checkbox]').forEach(e=>{const n=nm(e);if(!n||n.length>60||out[n]!==undefined)return;let v;if(e.tagName==='SELECT')v=e.selectedOptions[0]?.text??'';else if(e.type==='checkbox'||e.getAttribute('role')==='switch'||e.getAttribute('role')==='checkbox')v=(e.checked??e.getAttribute('aria-checked')==='true')===true||e.getAttribute('aria-checked')==='true';else v=e.value;out[n]=v;});out.__titulo=document.title;return out;}).catch(()=>({}));
let out={},prev=-1;
for(let i=0;i<12;i++){await expand();await wait(i?700:900);out=await leer();const n=Object.keys(out).length;const faltan=required.filter(k=>out[k]===undefined);if(!faltan.length&&n===prev)break;prev=n;}
out.__faltan=required.filter(k=>out[k]===undefined);
return out;
},
preflight:async ({item,customer,vendor,location}={})=>{
const av=[],datos={};const num=s=>parseFloat(String(s||'0').replace(/\./g,'').replace(',','.'))||0;
const falta=(qué,f)=>{if(f.__faltan&&f.__faltan.length)av.push(`LECTURA INCOMPLETA en ${qué}: ${f.__faltan.join(', ')} (no se pudo comprobar; revisar a mano)`);};
if(item){const f=await L.readCard(30,`'No.' IS '${item}'`,['Tipo','Bloqueado','Reserva','Directiva reaprov.','Cód. compra','Cód. seguim. prod.','Ventas bloqueadas','Compras bloqueadas']);falta('producto '+item,f);datos.producto={Tipo:f['Tipo'],Bloqueado:f['Bloqueado'],'Ventas bloqueadas':f['Ventas bloqueadas'],'Compras bloqueadas':f['Compras bloqueadas'],Reserva:f['Reserva'],'Directiva reaprov.':f['Directiva reaprov.'],'Sistema reposición':f['Sistema reposición'],'Nº proveedor':f['Nº proveedor'],'Cód. compra':f['Cód. compra'],'Cód. seguim. prod.':f['Cód. seguim. prod.']??f['Cód. seguimiento producto'],'Grupo registro inventario':f['Grupo registro inventario'],'Grupo contable prod. gen.':f['Grupo contable prod. gen.'],'Evitar inventario negativo':f['Evitar inventario negativo']};
const p=datos.producto;
if(p.Tipo&&p.Tipo!=='Inventario')av.push(`Producto ${item}: Tipo="${p.Tipo}" → no genera stock ni se planifica`);
if(p.Bloqueado===true)av.push(`Producto ${item} BLOQUEADO`);
if(p['Ventas bloqueadas']===true)av.push(`Producto ${item}: ventas bloqueadas → no se puede usar en documentos de venta`);
if(p['Compras bloqueadas']===true)av.push(`Producto ${item}: compras bloqueadas → no se puede usar en documentos de compra`);
if(p.Reserva==='Nunca')av.push(`Producto ${item}: Reserva=Nunca → "Reserva no debe ser Nunca" al reservar (la línea copia el valor al validar el Nº)`);
if(p.Reserva==='Siempre')av.push(`Producto ${item}: Reserva=Siempre → reserva automática al crear líneas`);
if(!p['Directiva reaprov.'])av.push(`Producto ${item}: sin Directiva reaprov. → la planificación no lo planifica`);
if(p['Cód. compra'])av.push(`Producto ${item}: Cód. compra=${p['Cód. compra']} → líneas de venta con envío directo/pedido especial`);
if(p['Cód. seguim. prod.'])av.push(`Producto ${item}: seguimiento ${p['Cód. seguim. prod.']} → exige lote/serie al registrar`);
if(p.Tipo==='Inventario'&&!p['Grupo registro inventario'])av.push(`Producto ${item}: sin Grupo registro inventario → no se podrá registrar`);
if(!p['Grupo contable prod. gen.'])av.push(`Producto ${item}: sin Grupo contable prod. gen.`);}
if(customer){const f=await L.readCard(21,`'No.' IS '${customer}'`,['Bloqueado','Reserva','Crédito máximo (DL)','Cód. forma pago','Cód. divisa']);falta('cliente '+customer,f);datos.cliente={Bloqueado:f['Bloqueado'],Reserva:f['Reserva'],'Crédito máximo (DL)':f['Crédito máximo (DL)'],'Cód. forma pago':f['Cód. forma pago'],'Cód. almacén':f['Cód. almacén'],'Cód. divisa':f['Cód. divisa']};
const c=datos.cliente;
if(c.Bloqueado&&c.Bloqueado.trim())av.push(`Cliente ${customer} bloqueado (${c.Bloqueado})`);
if(c.Reserva==='Nunca')av.push(`Cliente ${customer}: Reserva=Nunca → sus líneas no se podrán reservar`);
if(num(c['Crédito máximo (DL)'])>0)av.push(`Cliente ${customer}: crédito máximo ${c['Crédito máximo (DL)']} → al superarlo solo sale una notificación (no bloquea)`);
if(c['Cód. almacén'])av.push(`Cliente ${customer}: almacén por defecto ${c['Cód. almacén']} en las líneas`);
if(c['Cód. divisa'])av.push(`Cliente ${customer}: divisa ${c['Cód. divisa']}`);}
if(vendor){const f=await L.readCard(26,`'No.' IS '${vendor}'`,['Bloqueado','Cód. forma pago','Cód. divisa']);falta('proveedor '+vendor,f);datos.proveedor={Bloqueado:f['Bloqueado'],'Cód. forma pago':f['Cód. forma pago'],'Cód. divisa':f['Cód. divisa']};
if(datos.proveedor.Bloqueado&&datos.proveedor.Bloqueado.trim())av.push(`Proveedor ${vendor} bloqueado (${datos.proveedor.Bloqueado})`);}
if(location){const k=['Recepción requerida','Envío requerido','Requerir almacenamiento','Picking requerido','Ubicac. obligatoria','Ubic. y pick. dirigido'];const f=await L.readCard(5703,`'Code' IS '${location}'`,k);falta('almacén '+location,f);datos.almacen=Object.fromEntries(k.map(x=>[x,f[x]]));
const a=datos.almacen;
if(a['Envío requerido']||a['Recepción requerida'])av.push(`Almacén ${location}: exige ${[a['Recepción requerida']&&'recepción',a['Envío requerido']&&'envío'].filter(Boolean).join(' y ')} de almacén → en pedidos la cantidad a enviar/recibir queda a 0; registrar desde el documento de almacén. Hace falta ser empleado de almacén (7328)`);
if(a['Picking requerido'])av.push(`Almacén ${location}: exige picking → registrar el picking antes del envío; lo recibido no está disponible para picking hasta registrar su ubicación`);
if(a['Ubicac. obligatoria'])av.push(`Almacén ${location}: ubicación obligatoria → hay movimientos de almacén y hace falta código de ubicación`);}
{const f=await L.readCard(461,'',['Evitar inventario negativo','Ajuste automático coste']);falta('config. inventario',f);datos.inventario={'Evitar inventario negativo':f['Evitar inventario negativo'],'Ajuste automático coste':f['Ajuste automático coste'],'Variación existencias automát.':f['Variación existencias automát.']};
if(datos.inventario['Evitar inventario negativo']===false)av.push('Inventario negativo PERMITIDO → un envío sin reserva puede consumir stock reservado sin aviso (queda un negativo abierto)');
if(datos.inventario['Ajuste automático coste']==='Siempre')av.push('Ajuste automático de coste = Siempre → el informe 795 no tendrá nada que ajustar');}
{const f=await L.readCard(118,'',['Permitir registro desde','Permitir registro hasta']);falta('config. contabilidad',f);datos.contabilidad={'Permitir registro desde':f['Permitir registro desde'],'Permitir registro hasta':f['Permitir registro hasta']};
if(datos.contabilidad['Permitir registro desde']||datos.contabilidad['Permitir registro hasta'])av.push(`Fechas de registro permitidas: ${datos.contabilidad['Permitir registro desde']||'…'} – ${datos.contabilidad['Permitir registro hasta']||'…'} (revisar también la configuración del usuario, 119)`);}
return {avisos:av,datos};
},
title:()=>page.title(),
};
return L;
};
page.__qa = QA; return "QA cargada";
}
