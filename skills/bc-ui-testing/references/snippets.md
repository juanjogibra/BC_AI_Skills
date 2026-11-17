# Fragmentos reutilizables para `browser_run_code_unsafe` (comprobados 17/11/2026)

Sustituir `BASE` por `https://businesscentral.dynamics.com/<tenant>/<entorno>?company=<empresa>`.
Un solo `run_code` con varios pasos evita idas y vueltas (crear 3 fichas ≈ 60 s).

## Leer la lista principal de una página (tabla o mosaico)
```js
async (page) => {
  const read = async (id, filter) => {
    await page.goto(`BASE&page=${id}${filter ? '&filter=' + encodeURIComponent(filter) : ''}`);
    for (let i = 0; i < 25; i++) {
      await page.waitForTimeout(1000);
      const r = await page.evaluate(() => {
        const d = document.querySelector('iframe')?.contentDocument; if (!d) return null;
        const g = d.querySelector('[role=grid]'); if (!g) return null;          // 1ª grid = lista principal
        const t = g.innerText.replace(/\s+/g, ' ').trim();
        if (/Cargando|Recuperando/.test(t) && !/nada que mostrar/.test(t)) return null;
        if (/nada que mostrar/.test(t)) return 'VACÍO';
        const rows = [...g.querySelectorAll('tbody tr')].filter(x => x.innerText.trim()).map(x => x.innerText.replace(/\s+/g, ' ').trim());
        return rows.length ? rows : t;                                           // mosaico: texto
      }).catch(() => null);
      if (r) return r;
    }
  };
  return { movs: await read(38, "'Item No.' IS 'X' AND 'Open' IS '1'") };
}
```
**Mejor aún, con cabeceras** (verificación exacta `Campo=valor`): sustituir el `map` de filas por
```js
const head = [...g.querySelectorAll('thead th')].map(h => h.innerText.replace(/\s+/g, ' ').trim());
const rows = [...g.querySelectorAll('tbody tr')].filter(x => x.innerText.trim()).map(x => [...x.querySelectorAll('td')]
  .map((td, i) => [head[i], td.innerText.replace(/\s+/g, ' ').trim()]).filter(([h, v]) => h && v).map(([h, v]) => `${h}=${v}`).join(' | '));
```
Verificar un documento registrado = un solo `run_code` leyendo 25/20/38/5802 con esto (~20 s).

No incluir fichas en recorridos en bloque (al salir disparan `beforeunload`). No usar `<>` en filtros.

## Crear una ficha (cliente 21, proveedor 26, producto 30...) con plantilla
`&page=<id>&mode=create` abre directamente "Seleccionar una plantilla..." → Aceptar (primera) o elegir fila.
```js
async (page) => {
  const fr = page.frameLocator('iframe').first();
  page.on('dialog', d => d.accept().catch(() => {}));
  const expand = () => page.evaluate(() => {           // despliega pestañas y "Mostrar más" (campos ocultos como Cód. divisa)
    const d = document.querySelector('iframe').contentDocument;
    d.querySelectorAll('[aria-expanded="false"]').forEach(b => { if (/Facturaci|Pagos|General|Dirección|Envío|Precios|Recepci/i.test(b.innerText || b.getAttribute('aria-label') || '')) b.click(); });
    [...d.querySelectorAll('button,[role=button]')].filter(b => /^Mostrar más$/i.test((b.innerText || '').trim())).forEach(b => b.click());
  });
  const setF = async (re, v) => { const el = fr.getByRole('combobox', { name: re }).or(fr.getByRole('textbox', { name: re })).first();
    await el.click(); await el.fill(v); await el.press('Tab'); await page.waitForTimeout(1500); return el.inputValue().catch(() => '?'); };
  await page.goto('BASE&page=21&mode=create');
  await fr.getByRole('dialog').getByRole('button', { name: 'Aceptar', exact: true }).click({ timeout: 25000 });
  await page.waitForTimeout(4000); await expand(); await page.waitForTimeout(1200); await expand();
  const r = { nombre: await setF(/^Nombre$/, 'QA ...'), divisa: await setF(/divisa/i, 'USD') };
  r.titulo = await page.title();   // "Ficha cliente - C000xx ∙ Nombre" → nº asignado
  return r;
}
```
Los `input` de BC no tienen `aria-label` directo: localizar con `getByRole(..., { name: /regex/ })`, no con `querySelector('[aria-label]')`.

## Pedido de venta completo (comprobado: pedido → lote → enviar y facturar)
- `&page=42&mode=create` crea el pedido sin plantilla; `setF(/^Nombre del cliente$/, '<nº cliente>')` → título "Pedido venta - <nº> ∙ <nombre>".
- Líneas: limitar a la cuadrícula `fr.getByRole('grid', { name: /Líneas|Lines/ })` y rellenar `Nº`, `Cód. almacén`, `Cantidad` (Tab tras cada uno). **No escribir en `Tipo`**: es selector de opciones, ya viene "Producto" y escribir texto deja la página en error ("'Producto' no es un tipo válido...") → F5 + "Sí" para descartar.
- Seguimiento en documentos: seleccionar la línea (clic en su `Cantidad`) → menuitem `Información relacionada` → texto `Líns. seguim. prod.`. Localizar el diálogo por nombre: `getByRole('dialog', { name: /Líns\. seguim\. prod\./ })` (`dialog().last()` puede ser un diálogo vacío). Si el lote ya existe, la caducidad se rellena sola: basta `Nº lote` + `Cantidad (base)`.
- Registrar: menuitem `Registrar...` → diálogo "Enviar / Facturar / Enviar y facturar" → clic en el texto `Enviar y facturar` → `Aceptar` → "El pedido se registró con el número X... ¿Quiere abrir la factura registrada?" → `No`.

## Diario de productos con lote y registro
- Página 40 abre la última sección (p. ej. PREDET.) con una línea "Ajuste positivo" lista. Rellenar `Nº producto`, `Cód. almacén`, `Cantidad` con `setF`.
- Seguimiento: menuitem `Línea` (`.last()`) → texto `Líns. seguim. prod.` → diálogo. `Nº lote` es textbox; **`Fecha caducidad` es un selector de fecha sin rol accesible**: tras Tab desde Nº lote queda con el foco → `page.keyboard.type('31/12/2030')` + Tab, y luego `keyboard.type(cantidad)` + Tab para `Cantidad (base)`. Cerrar con el botón `Cerrar` del diálogo.
- Al volver, la barra de acciones queda en la pestaña "Línea": pulsar menuitem `Inicio` antes de `Registrar` (si no, "Registrar" no existe en el DOM). Cerrar antes el globo "Acerca de..." con botón `Entiendo`.
- Registrar → diálogo "¿Confirma que desea registrar las líneas del diario?" → `Sí` → "Se han registrado correctamente las líneas del diario." → `Aceptar`.
- Leer diálogos: `[...contentDocument.querySelectorAll('[role=dialog]')]` filtrando los que empiezan por "Acerca de" (globos de ayuda).
