---
name: bc-ui-testing
description: Pruebas funcionales en la interfaz web de Business Central (BC online) manejando el navegador con el MCP de Playwright mientras el usuario lo supervisa en VS Code. Usar cuando el usuario pida abrir páginas de BC, crear o modificar documentos/fichas (facturas, pedidos, clientes, artículos...), reproducir un flujo o comprobar un desarrollo AL en el cliente web.
---

# Pruebas en la interfaz web de Business Central

Objetivo: ir directo. Abrir por URL, localizar solo el control necesario, actuar y verificar. Nada de leer la página entera ni de esperas fijas largas.

Esta skill es la mecánica de la interfaz. Para validar un desarrollo o incidencia (qué probar, matriz de casos, verificación en movimientos, defectos, informe) usar también la skill `bc-qa`.

## 0. Entorno (montaje del usuario)

- Navegador: Edge headless con depuración en `127.0.0.1:9222` y perfil propio. Arrancar/reiniciar:
  `powershell -File {{USERPROFILE}}\bc-browser\start-bc-browser.ps1 [-Url <url>] [-Restart] [-Visible]`
  (`-Visible` solo si Microsoft pide login/MFA interactivo; el SSO de Windows suele entrar solo).
- Control: MCP `playwright` (`--cdp-endpoint http://127.0.0.1:9222`). Si las herramientas `mcp__playwright__*` no están cargadas, cargarlas con ToolSearch.
- Supervisión: el usuario lo ve en VS Code con Microsoft Edge Tools > Targets > "Toggle browser" (screencast). El aviso "simulated preview / Headless mode" es normal: ignorarlo.
- Trabajar SIEMPRE en una única pestaña (la que ve el usuario). No abrir pestañas nuevas.
- **Al empezar, `browser_resize(1600, 1000)`**: con el viewport por defecto las cabeceras fijas de las cuadrículas tapan las celdas y los clics fallan ("subtree intercepts pointer events").
- Comprobar que el navegador está vivo: `Invoke-RestMethod http://127.0.0.1:9222/json/list`.
- **Ficheros de salida FUERA del proyecto (obligatorio)**: el MCP `playwright` lleva `--output-dir {{USERPROFILE_FWD}}/bc-browser/playwright-output` en `~/.claude.json`. Sin ese argumento escribe `.playwright-mcp/` (logs, snapshots, capturas) en el proyecto: si aparece esa carpeta en un proyecto, borrarla al terminar y revisar la config. Nunca resolverlo con `.gitignore`. Al terminar cada sesión de pruebas, vaciar `playwright-output`. Playwright solo permite escribir dentro de su output-dir (o del proyecto): no pasar `filename` hacia el scratchpad (da "outside allowed roots"); dejar el nombre por defecto.

## 0b. Subir una extensión como PTE (no dev)

- Página **2507** "Carga e implementación de una extensión": `.../<entorno>?page=2507`. Botón `"Revisar o actualizar el valor de Seleccionar archivo .app"` → botón `"Coloque un archivo para cargar o haga clic aquí para examinar"` → `browser_file_upload` → checkbox `/Al implementar esta extensión/` → botón `"Implementar"` (exact). Por defecto "Versión actual" y sincronización "Agregar".
- Responde "La instalación de la extensión está en curso" → seguimiento en la página **2508** "Estado de instalación de extensión" (Estado: En curso / Completado / Error). Si da Error: abrir la fila → "Ver detalles" → sección "Detalles del error" (captura).
- **Obligatorio (petición del usuario): al instalar una versión nueva de una extensión que ya estaba instalada y publicada, despublicar la versión antigua UNA VEZ que la nueva esté instalada** (estado "Completado" en 2508 y versión nueva instalada en 2500). Nunca antes: si la nueva falla, la antigua debe seguir disponible. Comprobado (17/11/2026): al subir una PTE nueva sobre una PTE instalada, BC suele retirar sola la versión anterior. Verificarlo en 2500 en vista Lista (menú "Diseño ..." → "Lista", muestra columna Versión; cada versión publicada sale como fila/mosaico aparte). Si sigue apareciendo la antigua: "Mostrar más opciones" → "Anular publicación". Ojo: "Más información" abre la web del editor en otra pestaña; cerrarla y volver a la pestaña 0.
- Si los clics se quedan en "waiting for element to be visible, enabled and stable", la pestaña de BC está en segundo plano (p. ej. se abrió la de Edge DevTools): `browser_tabs(select, 0)`.
- `browser_file_upload` solo admite ficheros dentro del proyecto o del output-dir de Playwright. Un .app de Descargas no se puede subir directamente: pedir al usuario que lo deje en `{{USERPROFILE_FWD}}/bc-browser/playwright-output` (y borrarlo después).
- Dependencias: una PTE solo puede depender de extensiones publicadas como PTE/AppSource; si la dependencia está publicada por dev, falla con "The app has dependencies missing ... Dependency that is missing". Instalar primero la dependencia como PTE (orden: dependencias → extensión).
- No subir una versión inferior a la ya publicada en el entorno: comprobar antes en 2500 la versión de la extensión y de sus dependencias.
- Lista de entornos: Admin Center `https://businesscentral.dynamics.com/<tenantId>/admin` (tabla Name/Type). No tocar Production sin permiso explícito.
- Al cambiar de entorno el cliente tarda ~15 s en cargar (pantalla "Business Central" en blanco): esperar antes de buscar controles. En headless puede salir "Hemos pausado mientras estaba fuera. Actualice para continuar." tras pulsar Implementar: el envío ya se ha hecho; verificar en 2508.

## 1. Navegar por URL (lo más rápido)

Base: `https://businesscentral.dynamics.com/<tenantId>/<entorno>?company=<empresa URL-encoded>`

| Parámetro | Uso |
|---|---|
| `page=<id>` | Abre la página por ID |
| `filter='Campo' IS 'valor'` | Posiciona/filtra (nombre del campo en inglés, p. ej. `'No.'`) → abrir una ficha concreta |
| `mode=edit` / `mode=view` | Modo de apertura de fichas |
| `company=` | Empresa; codificar espacios como `%20` |

Ejemplo ficha de factura: `...&page=43&mode=edit&filter='No.'%20IS%20'FV25-00005'`

Páginas habituales:

| Página | ID | Página | ID |
|---|---|---|---|
| Clientes (lista) | 22 | Ficha cliente | 21 |
| Proveedores (lista) | 27 | Ficha proveedor | 26 |
| Artículos (lista) | 31 | Ficha artículo | 30 |
| Facturas venta (lista) | 9301 | Factura venta | 43 |
| Pedidos venta (lista) | 9305 | Pedido venta | 42 |
| Ofertas venta (lista) | 9300 | Abono venta | 44 |
| Facturas venta registradas | 143 | Factura venta registrada | 132 |
| Facturas compra (lista) | 9308 | Factura compra | 51 |
| Pedidos compra (lista) | 9307 | Pedido compra | 50 |
| Movs. contabilidad | 20 | Diario general | 39 |
| Extensiones instaladas | 2500 | Empresas | 357 |
| Diario de productos | 40 | Movs. productos | 38 |
| Mensajes de error (registro) | 700 | Almacenes | 15 |

Comprobados en uso real: 22, 9301, 43, 38, 40, 700. Los filtros con varias condiciones funcionan: `filter='Item No.' IS 'X' AND 'Open' IS '1'`. `mode=edit` funciona en fichas. La página 40 pide primero plantilla (GENERAL) y abre la última sección usada.

Al navegar desde una página con cambios o abierta, BC lanza un diálogo `beforeunload`: aceptarlo con `browser_handle_dialog(accept: true)` (los datos ya están guardados; BC guarda campo a campo).

## 2. Comportamiento de BC que hay que saber

- **Guardado automático**: cada campo se valida y guarda al salir de él (Tab). Una línea se confirma al salir de la fila. No hay botón "Guardar".
- **Esc cierra la página/ficha actual** (vuelve a la lista), además de cerrar avisos. NO usar Esc para quitar los "teaching tips" (globos "Acerca de..."): ignorarlos o pulsar su botón de cerrar.
- **Botón lápiz de la cabecera es un conmutador** y su nombre accesible describe la ACCIÓN, no el estado:
  - `"Realizar cambios en la página"` → ahora está en solo lectura; pulsarlo pasa a edición.
  - `"Abrir la página en modo de solo lectura"` → YA está en edición; NO pulsarlo.
  Comprobar el nombre antes de hacer clic. Alternativa: abrir con `mode=edit`.
- **Nuevo documento**: en la lista, menuitem `"Nuevo"` (o el botón `"Cree un entrada nueva."` en la ficha). Se abre `form "Nuevo - <Página>"`; el registro se inserta al validar el primer campo clave (p. ej. cliente) y el título pasa a `"<Página> - <Nº> ∙ <Nombre>"`.
- **Cliente/proveedor en documentos**: escribir el **número** en el combobox `"Nombre del cliente"` / `"Nombre del proveedor"` y Tab; BC lo resuelve por número.
- **Lookups (combobox en líneas)**: `Alt+↓` no abre la lista de forma fiable. Escribir texto con `browser_type(slowly: true)` → aparece un grid `"Lookupform<ID>_<Tabla>"` con sugerencias; hacer clic en el botón de la fila (`"Nº, ordenados en el pedido Ascendente <valor>"`). Si se conoce el valor exacto: escribirlo y Tab.
- **Líneas**: grid `"Líneas"`; la fila activa tiene `[selected]`. Las filas vacías tienen controles `"... (En blanco)"` (solo lectura); usar los controles de la fila seleccionada (`combobox "Tipo"`, `combobox "Nº"`, `textbox "Cantidad"`, `textbox "Precio venta excl. IVA"`...).
- **Barra de notificación** (p. ej. "¿Desea configurar la transmisión de documentos SII?"): no bloquea; ignorarla.
- **Errores de BC**: aparecen como `dialog "<título> <mensaje>"` dentro del iframe. Leer el texto del nombre del diálogo; botón `"Aceptar"`.
- **Estado del guardado**: arriba a la derecha "No guardado" / "Guardando..." / "Guardado". Si queda "No guardado" en una línea, moverse de fila (ArrowDown) para confirmarla.
- **Error de validación en página** ("La página tiene un error. Seleccione Actualizar (F5)..."): la página queda bloqueada y las acciones (Lanzar...) no hacen nada. Leer el error real con `browser_evaluate` sobre el documento del iframe buscando `[class*="error"]` (atributo `title`/texto). Para desbloquear: F5 → diálogo "¿Desea descartar estos cambios?" → "Sí".
- **Lanzar / Registrar**: tras lanzar, el botón "Lanzar" pasa a "Volver a abrir" (así se verifica). Registrar pide "¿Confirma que desea registrar...?" y al terminar "La factura se registró con el número X... ¿Quiere abrir la factura registrada?". Si el registro falla, BC navega a la página 700 "Mensajes de error": leer la descripción (captura) y el contexto (registro/línea).
- **Botones duplicados**: la barra de notificación (p. ej. SII) también tiene "Sí". En diálogos usar `iframe >> nth=0 >> internal:control=enter-frame >> internal:role=dialog >> internal:role=button[name="Sí"s]`.
- **Almacenes**: "Se requiere Almacén Envío" = el almacén exige envío de almacén → no se puede facturar directamente; usar otro almacén. Al lanzar puede exigirse almacén ("Cód. almacén debe tener un valor").
- **Seguimiento por lote** ("Debe asignar un número de lote al producto"): en la factura, apartado Líneas → menú "Línea" → "Información relacionada" → "Líns. seguim. prod." → rellenar `Nº lote` (la caducidad se completa sola si el lote existe) y `Cantidad (base)` → Cerrar. No hace falta volver a abrir la factura lanzada.
- **Sin stock del producto/lote** (indicado por el usuario): ajuste positivo en el diario de productos (página 40): `Tipo mov.` es un `<select>` → `browser_fill_form` tipo combobox "Ajuste positivo"; Nº documento, Nº producto, Cód. almacén, Cantidad; menú "Línea" → "Líns. seguim. prod." → lote (+ fecha caducidad si el código es tipo SEGLOTCAD) y cantidad → Cerrar → Inicio → Registrar → "Sí". Para ver dónde hay stock: página 38 con `filter='Item No.' IS '<art>' AND 'Open' IS '1'`.
- **Filas de cuadrícula**: solo la fila seleccionada tiene controles editables; las demás son `span` de solo lectura y los clics se interceptan. Para cambiar de fila: clic en un control de la fila seleccionada y ArrowUp/ArrowDown.
- **Lookups con botón**: "Elegir un valor para <Campo>" abre el grid `Lookupform<ID>_<Tabla>`; seleccionar con el botón `"Código, ordenados en el pedido Ascendente <valor>"`. Para listar todas las opciones: `browser_evaluate` sobre el grid leyendo `tbody tr`.
- Todo el cliente va dentro de un `iframe`; los refs `fNNeNN` del snapshot ya lo resuelven. Los refs cambian al recargar: si un ref no existe, volver a buscarlo, no reintentar el mismo.
- Idioma de la interfaz: español. Usar los textos accesibles en español.

## 3. Forma de trabajar con el MCP (eficiencia)

1. Navegar por URL directamente a la página/registro.
2. **`browser_wait_for(text/textGone)` NO ve el contenido del iframe de BC** (solo la página exterior): esperar por texto de BC siempre agota el tiempo. Excepción útil: `textGone` sí funciona para "No guardado"/"Guardando"/"La página tiene un error". Para comprobar estado usar `browser_take_screenshot` (funciona en headless y es lo más fiable para leer diálogos, errores y totales) o `browser_find`. Esperas fijas cortas (2-5 s; 8-10 s al registrar).
3. Localizar controles con `browser_find(regex: ...)` (barato) en vez de `browser_snapshot` completo (las páginas de BC generan snapshots de >90k caracteres). Si hace falta el snapshot, usar `target` (un nodo concreto) o `filename` y luego Grep.
4. Rellenar: `browser_type` + `browser_press_key("Tab")` para disparar la validación. Para varios campos de cabecera, `browser_fill_form`.
5. Verificar el resultado con un `browser_find` puntual (valor del campo, título de la página, diálogo de error).
6. Narrar al usuario en una línea qué se va a hacer antes de cada paso visible, porque lo está viendo en directo.

Selectores estables (no dependen de refs que cambian): `iframe >> nth=0 >> internal:control=enter-frame >> internal:role=button[name="Lanzar"s]`, `... internal:role=menuitem[name="Línea"s] >> nth=-1` (el último = el del subformulario de líneas), `... internal:text="Líns. seguim. prod."s`. Si `browser_evaluate` sobre un ref devuelve vacío, el ref está obsoleto: hacer captura y volver a localizar.

Flujo probado de factura de venta hasta registrar: lista 9301 → Nuevo → nº cliente en "Nombre del cliente" + Tab → línea: Nº (lookup) → Cód. almacén sin envío obligatorio → Cantidad + Tab → ArrowDown → (lote si aplica) → Lanzar → Registrar → Sí (en el diálogo) → "Sí" para abrir la registrada.

Regex útiles para `browser_find`:
- Controles editables: `/combobox "Nº"|textbox "Cantidad"/`
- Errores: `/dialog "[^"]*"/`
- Botones de acción: `/menuitem "Nuevo"|menuitem "Registrar"/`
- Estado edición: `/Realizar cambios en la página|Abrir la página en modo de solo lectura/`

## 4. Seguridad de datos

- Antes de registrar, lanzar, eliminar o enviar documentos, confirmar con el usuario salvo que lo haya pedido explícitamente.
- Comprobar el entorno (`Entorno: <nombre>` en la cabecera) antes de crear datos: no crear datos de prueba en Production sin permiso explícito.
- Al terminar, informar de los documentos creados (nº, empresa, entorno) para que se puedan limpiar.

## 5. Ampliar esta skill

**Obligatorio (petición del usuario):** al terminar cada sesión de pruebas, añadir aquí todo lo aprendido nuevo, sin esperar a que lo pida, y decirle en una línea qué se ha añadido. Cuando en una sesión se descubra un comportamiento nuevo de BC (otro conmutador, un lookup distinto, una URL útil, un atajo comprobado), añadirlo aquí en la sección correspondiente. Los atajos de teclado (`Alt+N` nuevo, `Ctrl+Alt+F2`...) deben probarse antes de documentarlos como fiables.
