const QA=(page,BASE)=>{
const fr=page.frameLocator('iframe').first();
const wait=ms=>page.waitForTimeout(ms);
const L={
fr,wait,
dialogs:()=>page.evaluate(()=>[...document.querySelector('iframe').contentDocument.querySelectorAll('[role=dialog]')]
.map(x=>x.innerText.replace(/\s+/g,' ').slice(0,300)).filter(t=>t&&!/^Acerca de/.test(t))).catch(()=>[]),
answer:async (names)=>{for(const n of names){const b=fr.getByRole('dialog').getByRole('button',{name:n,exact:true});if(await b.count()){await b.first().click().catch(()=>{});await wait(1500);return n;}}return null;},
set:async (scope,re,v)=>{const el=scope.getByRole('combobox',{name:re}).or(scope.getByRole('textbox',{name:re})).first();await el.fill(String(v));await el.press('Tab');await wait(2000);return el.inputValue().catch(()=>'?');},
expandLines:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;[...d.querySelectorAll('[aria-expanded="false"]')].filter(b=>/^\s*Líneas\s*$/.test(b.innerText)).forEach(b=>b.click());}).catch(()=>{}),
lines:()=>fr.getByRole('grid',{name:/Líneas|Lines/}).first(),
columns:async (grid)=>(await grid.getByRole('columnheader').allInnerTexts()).map(t=>t.replace(/\s+/g,' ').trim()).filter(Boolean),
noUnload:()=>page.evaluate(()=>{window.onbeforeunload=null;try{document.querySelector('iframe').contentWindow.onbeforeunload=null;}catch(e){}}).catch(()=>{}),
open:async (pageId,extra='')=>{await L.noUnload();for(let t=0;t<3;t++){try{await page.goto(`${BASE}&page=${pageId}${extra}`);break;}catch(e){await wait(2000);}}await wait(1500);for(let i=0;i<40;i++){const ok=await page.evaluate(()=>{const d=document.querySelector('iframe')?.contentDocument;return !!(d&&d.querySelector('form')&&document.title&&document.title !=='Dynamics 365 Business Central');}).catch(()=>false);if(ok)break;await wait(300);}await wait(800);},
acts:async (re,tabs=['Inicio','Preparar','Recibo','Pedido','Acciones','Línea','Procesar','Registrar'])=>{const out=new Set();const grab=()=>page.evaluate((src)=>{const rx=new RegExp(src,'i');return [...document.querySelector('iframe').contentDocument.querySelectorAll('[role=menuitem],button[title]')].map(e=>(e.getAttribute('aria-label')||e.innerText||e.getAttribute('title')||'').trim()).filter(t=>t&&t.length<60&&rx.test(t));},re.source);(await grab()).forEach(x=>out.add(x));for(const tb of tabs){const m=fr.getByRole('menuitem',{name:tb,exact:true}).first();if(await m.count()){await m.click().catch(()=>{});await wait(500);(await grab()).forEach(x=>out.add(x));}}return [...out];},
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
menu:async (name)=>{await fr.getByRole('menuitem',{name,exact:typeof name==='string'}).first().click();await wait(1500);},
post:async (option,act=/^Registrar(...)?$/)=>{
const pre=await L.notes();if(!L.force&&pre.some(t=>/disponible|insuficiente|no está en inventario|bloquead|crédito|vencid|saldo/i.test(t)))return {abortado:'NOTIFICACIÓN CRÍTICA ANTES DE REGISTRAR',notificaciones:pre};
await fr.getByRole('menuitem',{name:'Inicio',exact:true}).first().click().catch(()=>{});await wait(600);
await fr.getByRole('menuitem',{name:act}).first().click();await wait(2500);
if(option){await fr.getByRole('dialog').getByText(new RegExp('^'+option+'$')).first().click().catch(()=>{});await wait(800);await L.answer(['Aceptar']);}
const log=[];
for(let i=0;i<6;i++){await wait(3000);const ds=await L.dialogs();if(!ds.length){if(i>1)break;continue;}const t=ds[ds.length - 1];log.push(t.slice(0,200));
if(/abrir|registr.*n[úu]mero|se registr/i.test(t)){await L.answer(['No','Aceptar']);break;}
if(/¿/.test(t)){await L.answer(['Sí']);continue;}
await L.answer(['Aceptar']);}
return {dialogos:log,error700:await L.err700(),titulo:await page.title()};
},
err700:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;const g=[...d.querySelectorAll('[role=grid]')].find(x=>/Acción recomendada/.test(x.innerText));return g?[...g.querySelectorAll('tbody tr')].map(x=>x.innerText.replace(/\s+/g,' ').trim()).filter(t=>t.length>4):null;}).catch(()=>null),
tracking:async (fields)=>{
await fr.getByRole('menuitem',{name:'Línea',exact:true}).last().click();await wait(800);
await fr.getByText('Información relacionada',{exact:true}).last().click().catch(()=>{});await wait(800);
await fr.getByText('Líns. seguim. prod.',{exact:true}).first().click();await wait(5000);
const dlg=fr.getByRole('dialog',{name:/Líns\. seguim\. prod\./}).first();
for(const [re,v] of fields)await L.set(dlg,re,v);
await dlg.getByRole('button',{name:'Cerrar',exact:true}).click().catch(()=>{});await wait(3000);
const d=await L.dialogs();await L.answer(['Sí','Aceptar']);return d;
},
errs:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;return [...new Set([...d.querySelectorAll('[class*=error],[class*=Error],[role=alert]')].map(e=>(e.getAttribute('title')||e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t.length>10))].slice(0,3);}).catch(()=>[]),
pick:async (scope,re,label)=>{const s=scope.getByRole('combobox',{name:re}).first();await s.selectOption({label});await page.keyboard.press('Tab');await wait(1500);return s.evaluate(x=>x.options[x.selectedIndex].text).catch(()=>'?');},
fields:(re)=>page.evaluate((src)=>{const d=document.querySelector('iframe').contentDocument;const rx=new RegExp(src||'.','i');const nm=e=>e.getAttribute('aria-label')||(e.getAttribute('aria-labelledby')||'').split(' ').map(id=>d.getElementById(id)?.innerText||'').join(' ').trim();return [...new Set([...d.querySelectorAll('input,select,[role=combobox],[role=textbox]')].map(nm).filter(t=>t&&rx.test(t)))].slice(0,40);},re?re.source:''),
notes:()=>page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;const out=new Set();d.querySelectorAll('[class*=notification],[class*=Notification],[role=status],[role=alert]').forEach(e=>{const t=(e.innerText||'').replace(/\s+/g,' ').trim();if(t.length>15&&t.length<600)out.add(t);});return [...out].slice(0,5);}).catch(()=>[]),
title:()=>page.title(),
};
return L;
};
