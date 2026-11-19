---
name: bc-ui-testing
description: Pruebas funcionales en la interfaz web de Business Central (BC online) manejando el navegador con el MCP de Playwright mientras el usuario lo supervisa en VS Code. Usar cuando el usuario pida abrir páginas de BC, crear o modificar documentos/fichas (facturas, pedidos, clientes, artículos...), reproducir un flujo o comprobar un desarrollo AL en el cliente web.
---

# Pruebas en la interfaz web de Business Central

Objetivo: ir directo. Abrir por URL, localizar solo el control necesario, actuar y verificar. Nada de leer la página entera ni de esperas fijas largas.

Esta skill es la mecánica de la interfaz. Para validar un desarrollo o incidencia (qué probar, matriz de casos, verificación en movimientos, defectos, informe) usar también la skill `bc-qa`.

## 0. Entorno (montaje del usuario)

- **Preferencia del usuario (18/11/2026): probar SIEMPRE con el MCP `bc-en-vivo` (Chrome), una sesión de Chrome por cada sesión de Claude en VS Code.** Va más rápido que Edge con Playwright y no pisa los navegadores de otras sesiones. Flujo: `bc_abrir` (entorno del `launch.json`) → `bc_pedir_escritura` antes de crear o registrar → `bc_ejecutar_escritura` → `bc_cerrar` al terminar. Lo de Edge/Playwright de abajo queda como alternativa si `bc-en-vivo` no está disponible.
- **`bc-en-vivo` en ámbito de usuario (19/11/2026, petición del usuario: todos los proyectos y sesiones sin proyecto)**: entrada `mcpServers.bc-en-vivo` en `~/.claude.json` con `Code.exe` + `ELECTRON_RUN_AS_NODE=1` + lanzador `%USERPROFILE%\bc-browser\en-vivo-launcher.mjs`, que arranca la versión más reciente instalada de la extensión bc-ui-verifier (la ruta con versión de las entradas por proyecto se rompe al actualizarse). `BC_WORKSPACE` = `bc-browser\en-vivo-workspace` (su `.vscode/launch.json` apunta a Preproduction, empresa QA), `BC_CAPTURAS` = `bc-browser\capturas` (fuera de repositorios), `BC_OUTPUT` = globalStorage de la extensión `\output\usuario`. Las entradas por proyecto que crea la extensión tienen prioridad y usan el `launch.json` del proyecto. Las herramientas aparecen en sesiones NUEVAS. Prueba de arranque sin Claude: enviar por stdin `initialize` + `tools/list` (JSON-RPC) al lanzador con esas variables → 9 herramientas.
- **Capturas de `bc-en-vivo` NUNCA en un repositorio (regla del usuario 18/11/2026, todos los proyectos)**: `bc-en-vivo` guarda las capturas en `<proyecto>/Workflow/tickets/...`. Antes de cualquier commit, y siempre al terminar las pruebas, moverlas a `{{USERPROFILE}}\bc-browser\capturas\<cliente>-<fecha>` y borrar `Workflow/` del proyecto. Nunca hacer `git add` de `Workflow/` ni de imágenes de pruebas, y no resolverlo con `.gitignore`.
- `bc-en-vivo`, lectura: en fichas de solo lectura `bc.valorCampo` puede devolver null aunque el campo tenga valor; leer con `bc_abrir`/`bc_mirar` + `campos`, que es fiable. Varias páginas en un solo `bc_ejecutar` con `bc.abrir({page, filter})` en bucle (comprobado para albaranes + hoja de comentarios).
- **Vista previa de un report con `bc-en-vivo` (comprobado 18/11/2026)**: `bc_pedir_escritura` (solo vista previa) → `bc_ejecutar_escritura` con `bc.abrir({ report: <id> })` → en el diálogo, `getByRole('textbox', {name: /^Nº/})` fill + Tab → botón "Vista previa & cerrar". El PDF se abre en el visor dentro de BC: leerlo con `bc_captura` + `ver: true`. Para comprobar un dato de cabecera que la ficha no enseña (p. ej. Cód. vendedor oculto), filtrar la lista: `9305` con `'No.' IS 'X' AND 'Salesperson Code' IS 'Y'`.
- Informes con layout Word: si la vista previa sale en blanco, mirar la página **9660** "Diseños de informe" filtrada por `'Report ID'`. El layout de la extensión puede ser una plantilla vacía, con el bueno sin marcar como predeterminado. Para probar con otro layout: seleccionar su fila → "Ejecutar informe" → filtro → "Vista previa".

- Navegador (si `bc-en-vivo` no está cargado en la sesión): **Chrome por defecto** (preferencia del usuario 19/11/2026: "van mejor") con depuración en `127.0.0.1:9222` y perfil propio `profile-chrome`. Arrancar/reiniciar:
  `powershell -ExecutionPolicy Bypass -File {{USERPROFILE}}\bc-browser\start-bc-browser.ps1 [-Url <url>] [-Restart] [-Visible] [-Browser edge]`
  (`-Restart` cierra el navegador de pruebas que ocupe el puerto, sea Edge o Chrome; `-Visible` solo si Microsoft pide login/MFA interactivo). El perfil de Chrome es distinto del de Edge: la primera vez pide iniciar sesión. Antes de cualquier prueba, comprobar en `/json/list` que la pestaña está en businesscentral y no en login.microsoftonline.
- Control: MCP `playwright` (`--cdp-endpoint http://127.0.0.1:9222`). Si las herramientas `mcp__playwright__*` no están cargadas, cargarlas con ToolSearch.
- **Manejar OTRO navegador sin reiniciar la sesión (comprobado 17/11/2026)**: en `browser_run_code_unsafe`, `const b = await page.context().browser().browserType().connectOverCDP('http://127.0.0.1:9223'); page.__gt = b.contexts()[0].pages()[0];` y en las llamadas siguientes usar `page.__gt` (persiste). El frame de BC: `p.frames().find(fr => fr !== p.mainFrame() && /businesscentral/.test(fr.url()))` (el índice `frames()[1]` cambia tras navegar). Las capturas con `path` absoluto sí funcionan ahí.
- **Subir un fichero a un diálogo de BC (UploadIntoStream)** desde `run_code`: `const fc = p.waitForEvent('filechooser'); await frame.getByText('Coloque un archivo para cargar o haga clic aquí para examinar').click(); (await fc).setFiles('<ruta>');` (sin la limitación de carpetas de `browser_file_upload`).
- **Encuesta de Microsoft** ("A Microsoft le encantaría conocer su punto de vista") aparece sola y deja la página inert: cerrarla con "Cancelar".
- **Hacer clic en una celda de lista abre la ficha** (drill-down) y deja la lista inert. Para eliminar desde la ficha: `button[title="Eliminar la información"]` → "¿Eliminar <id>?" → "Sí". Ojo: las listas pueden tener filtros de código (p. ej. por oficina) que ocultan registros; la lista vacía no prueba que no existan. Los valores de los campos de una ficha NO salen en `innerText`: leerlos con `getByRole('textbox', {name})`.
- Supervisión: con Chrome visible, el usuario ve la ventana directamente. Con Edge headless se veía en VS Code con Microsoft Edge Tools > Targets > "Toggle browser" (screencast); el aviso "simulated preview / Headless mode" es normal.
- Trabajar SIEMPRE en una única pestaña (la que ve el usuario). No abrir pestañas nuevas.
- **Un navegador por cliente (montado 17/11/2026)**: varias sesiones de Claude sobre el mismo puerto se pisan la pestaña (comprobado: otra sesión navegó encima a mitad de prueba). Por eso cada cliente tiene su Edge: `start-bc-browser.ps1 -Name <cliente> -Port <puerto>` (perfil `profile-<cliente>` con su propio login; `-Restart` solo cierra ese perfil) y en sus proyectos un MCP `playwright` en ámbito local (`~/.claude.json` > `projects.<ruta>.mcpServers.playwright`, prevalece sobre el de usuario) con ese `--cdp-endpoint` y `--output-dir {{USERPROFILE_FWD}}/bc-browser/playwright-output-<cliente>`. 9222 = navegador por defecto (perfil `profile`); los puertos asignados a cada cliente están en su ficha (`bc-qa/privado/clientes/`). Cliente nuevo → siguiente puerto libre. El MCP se carga al iniciar la sesión: tras cambiarlo, abrir sesión nueva. Antes de navegar, comprobar en `http://127.0.0.1:<puerto>/json/list` que la URL de la pestaña es la que dejé (si cambia sola, hay otra sesión usando ese navegador: parar y avisar).
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
- No subir una versión inferior a la ya publicada en el entorno: comprobar antes en 2500 la versión de la extensión y de sus dependencias. Versión exacta sin cambiar el diseño de 2500: página **2504** con `filter='Name' IS '<extensión>'` → campo Versión (comprobado 18/11/2026).
- **Qué .app se sube (18/11/2026)**: la versión nueva sustituye a la anterior. Antes de compilar, saber desde qué rama se compila y qué desarrollos van dentro: el flujo depende del proyecto (está en la memoria del proyecto o en la ficha del cliente) y, si no está apuntado, se pregunta. **Para Producción, SIEMPRE desde `main`** (regla del usuario). Patrón habitual en sandbox: un ajuste se compila desde `main` + el ajuste, porque las otras ramas tienen desarrollos sin probar, y se lleva a esas ramas con merge solo cuando está validado. Antes de `al_build`, comprobar la rama actual: el usuario puede cambiarla a mitad de sesión.
- Con `bc-en-vivo` (página 2507): el botón es "Revisar o actualizar el valor de Seleccionar archivo .app" (el "Seleccionar archivo .app" a secas es el rótulo); si un globo de ayuda intercepta el clic, cerrar antes `button "Ocultar información sobre herramientas"`. "Implementar" es un botón del diálogo, no de la cinta: `bc.accion` no lo encuentra → `getByRole('dialog').getByRole('button', {name:'Implementar', exact:true})`. Seguir el estado en 2508 releyendo la página: la instalación de una PTE pequeña tardó 1-3 min ("En curso"). `bc.esperarA` corta a los 20 s, así que es mejor volver a abrir la 2508 cada poco que encadenar esperas.
- **Despublicar con `bc-en-vivo` (comprobado 18/11/2026)**: 2500 con `filter='Name' IS '<ext>'` → menú "Diseño" → opción "Lista" (es un `menuitemradio`, no un `menuitem`: localizarla por texto) → columnas Versión / "Se ha instalado". Por cada versión antigua no instalada: en su fila, "Mostrar más opciones" → "Anular publicación". No pidió confirmación. Comprobar al final que solo queda la nueva con "Se ha instalado = Sí".
- **`bc-en-vivo` en documentos (comprobado 18/11/2026)**:
  - `bc.nuevo(caption)` **sin `clave`** en documentos con serie: `clave` es el Nº del documento, no el cliente. Con una serie sin numeración manual da "No puede introducir números manualmente…" y la página queda bloqueada, y F5 no la libera. Salir a la lista y crear desde allí. El cliente se escribe después con `bc.escribir('Nombre del cliente', '<nº>')`.
  - Tipo de línea **"Artículo"** (ya estaba en la sección 2: leer la skill antes de escribir el script).
  - `bc.mensajeDeError()` puede devolver el título de la página con "Guardado": no es un error.
  - Comentarios de un documento: la página 67/5776 abierta por URL con la lista vacía sale en solo lectura. Entrar por la acción: pedido → menú "Pedido" → "Comentarios"; picking de inventario → "Relacionado" → "Picking" → "Comentarios" (desplegar antes con `bc_navegar` gesto menu). El título de la hoja es "Pedido ∙ <nº>", no "Comentarios".
  - Pedido lanzado: el campo Estado no se deja leer. Comprobarlo por el botón "Volver a abrir".
  - Crear picking de inventario desde el pedido: "Crear almac./ pick. inventario..." → marcar "Crear pick exist." → botón Aceptar del diálogo (no de la cinta). Lista de pickings de inventario: **9316**, ficha **7377** ("Rellenar cant. manip. autom.", "Registrar..." → opción "Enviar").
  - La sesión puede volver sola a la página de inicio tras una acción. Antes de escribir, reabrir la página (`bc_ejecutar_escritura` se niega si la página de encima no es la indicada: es una protección útil).
- **Clientes UE (comercio exterior)**: el registro exige "Especificación transacción" en el pedido (sección Comercio exterior; valores = Incoterms de la página 406, p. ej. EXW). Rellenarla al crear el pedido de prueba, no después del primer error.
- **Inicio de sesión / MFA** (comprobado 17/11/2026): cada tenant puede requerir una cuenta distinta; si Microsoft muestra una cuenta que no es (p. ej. la corporativa en un tenant personal), preguntar al usuario qué cuenta usar antes de insistir con códigos (el código "no previsto" suele ser de otra cuenta). Para MFA lo más fiable es reiniciar con `-Restart -Visible` y que el usuario complete el login en la ventana; la aprobación por notificación muestra un número que hay que comunicarle. Los códigos TOTP enviados por chat caducan por el camino. "Inicie sesión de otra forma" / "No puedo usar mi aplicación..." permite alternar entre notificación y código. Nunca guardar contraseñas en skills, memoria ni repositorio.
- **Copiar empresa** (página 357 → "Copiar"): pide nombre y activar el conmutador "Lo entiendo" (`checkbox "Lo entiendo"`) antes de Aceptar; muestra "En proceso... Creando nueva empresa <X>" y bloquea la pestaña mientras copia.
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

**Verificación por API (más rápida que la interfaz)**: `%USERPROFILE%\bc-browser\bc-api.ps1` (client credentials; tenant/clientId en `bcapi.json`; secreto cifrado DPAPI en `.bcapi.sec`, nunca en skills/repos). Uso: `. .\bc-api.ps1; Invoke-BCApi 'companies'` y `Invoke-BCApi "companies(<id>)/generalLedgerEntries" '$filter=documentNumber eq ''X'''`. La app de Entra necesita en BC (página "Aplicaciones de Microsoft Entra", 9860/9861) un conjunto de permisos de datos (p. ej. D365 READ); con solo D365 GLOBAL DIM MGT lista empresas pero devuelve 403 en datos. Dar permisos es decisión del usuario. Si el 403 dice `Page 30009 APIV2 - Customers Execute: _Exclude_APIV2_`, el token está bien (roles API.ReadWrite.All) y el bloqueo es de permisos dentro de BC (`_Exclude_APIV2_` es el nombre de la extensión que publica la API v2.0, no un conjunto de permisos): revisar en la ficha 9861 los conjuntos de la app; arreglado allí funciona en todas las empresas sin tocar Entra (comprobado 18/11/2026). Endpoints v2.0 comprobados: `customers`, `generalLedgerEntries`, `itemLedgerEntries`; `customerLedgerEntries` NO está en v2.0 (404) pero SÍ en `-Api 'microsoft/analytics/v1.0'` (junto a movs. proveedor, valor, almacén, fabricación) y en `microsoft/reportsFinance/beta` (detallados). Inventario completo y qué usar para verificar cada circuito: [references/apis-estandar.md](references/apis-estandar.md). Para diagnosticar un 403 leer el cuerpo de la respuesta (`$_.Exception.Response.GetResponseStream()`), no solo el código.

**Modo rápido de la librería (95 % menos tokens, comprobado 17/11/2026)**: ejecutar UNA vez `browser_run_code_unsafe(filename: <bc-browser>/playwright-output/load.js)` (generado con `{ echo "async (page) => {"; cat qa-lib.js; echo 'page.__qa = QA; return "QA cargada";'; echo "}"; } > playwright-output/load.js`), que guarda la librería en `page.__qa` (el objeto `page` persiste entre llamadas; `globalThis` y `require` NO). Después cada tarea con `qa-run.sh` lleva solo su cuerpo (~200-1000 bytes). Si da "page.__qa is not a function", recargar load.js. `qa-run.sh` borra antes el `run.js` anterior: **nunca se reejecuta una tarea obsoleta** si falla la generación.
**Reglas de calidad en scripts (aprendidas a base de errores)**:
- **Fail-fast**: no envolver en `.catch(()=>'ERR')` los pasos que son precondición; si un campo no se rellena, el script debe PARAR antes de registrar.
- **Leer notificaciones antes de registrar** (regla del usuario): `L.notes()`; `L.post()` lo hace y aborta si hay aviso crítico (stock en la ubicación, crédito, bloqueo, saldo vencido). Forzar solo con `L.force = true`.
- **Documentos existentes con `&mode=edit`**: en modo vista los campos no existen como entradas (`L.fields()` no los ve).
- Descubrir antes de actuar: `L.fields(/re/)` (nombres accesibles reales de campos, resuelve aria-labelledby), `L.acts(/re/)` (abre cada pestaña de la barra y lista acciones: p. ej. "Registrar recep." abreviado), `L.columns(grid)`.
- Errores de validación de campo NO son diálogos: `L.errs()` (barra "La página tiene un error" + mensaje). Campos de opciones (`<select>`, p. ej. Bloqueado: " /Envío/Factura/Todo"): `L.pick(scope, /re/, 'Todo')`.
- Filtros URL sobre campos de **opción**: el valor va en el idioma de la interfaz ("Transferencia") o su número; `'Entry Type' IS 'Transfer'` no filtra y devuelve todo.
- `L.read(pagina, filtro, max=15)` recorta filas: filtrar siempre lo más posible.
- `beforeunload` tras modificar una página (p. ej. diario con líneas) NO lo neutraliza `onbeforeunload=null`: tras el aviso, `browser_handle_dialog(accept)` y comprobar en datos qué llegó a registrarse.
- Almacén avanzado (comprobado 18/11/2026): lista de actividades pendientes (ubicaciones y pickings) **5774** (la 9313/9316 pueden salir vacías); ficha ubicación **5770** (acción "Registrar almacenamiento"), ficha picking **5779** ("Registrar picking"), ficha envío almacén **7335** ("Crear picking...", "Registrar envío..." → opciones Enviar / Enviar y facturar), albaranes de venta registrados **142** (filtro `'Order No.'`). Exigencias del almacén en ficha **5703** sección Almacén (Recepción/Envío requerido, Requerir almacenamiento, Picking requerido, Ubicac. obligatoria). Para leer las líneas de estos documentos, leer la cuadrícula que contiene el nº de producto (`td input.value` o texto), no `L.lines()`.
- **Clics que se quedan en "waiting for element to be visible, enabled and stable" con el navegador en modo visible**: la ventana está minimizada o tapada y Edge no pinta → `await page.bringToFront()` (ya lo hace `L.open`). Comprobado 18/11/2026: bloqueaba "Lanzar" y el globo de ayuda.
- **Globos "Acerca de <página>"** (primera visita a una página: hojas de demanda/planificación) dejan la página inerte: cerrar con su botón **"Descartar"** (`L.tips()`, ya incluido en `L.open`). Nunca Esc (cierra la página).
- `L.errs()` ignora la pista de Copilot "Pulse Alt + I para generar una sugerencia" (no es un error).
- Planificación y reservas (comprobado 18/11/2026): Hoja de demanda **291** (grupo "Envío directo" → "Traer pedidos venta..."; "Ejecutar mensajes acción..." en Inicio). Hoja de planificación **99000852** (pestaña **Preparar** → "Calc. planif. regenerativa..."; diálogo `name: /^Calcular plan/`; "Ejecutar mensajes acción..." en Inicio, diálogo `/^Ejecutar mensajes/` con `<select>` por tipo de pedido: elegir "Crear ped. compra"). Reserva en línea de venta: barra de líneas → "Línea" (último) → "Acciones" (último) → "Reserva..." → diálogo `/^Reservas/` (resumen en su `[role=grid]`, acciones "Reservar desde línea actual", "Reservar auto.", "Cancelar reserva desde línea actual"). En la ficha de producto el campo es **"Reserva"** (no "Reservar") y "Directiva reaprov."; fechas de líneas de compra son **combobox** (usar `L.set`, no `getByRole('textbox')`).
- Plantillas al crear producto (30, `mode=create`): el diálogo lista NO INVENTARIADO primero y `Aceptar` toma la fila seleccionada → producto "Fuera de inventario". Seleccionar la fila "PRODUCTO" antes de aceptar o corregir Tipo + Grupo registro inventario.
- Borrar línea de documento: clic en una celda de la fila + `Control+Delete` → "¿Desea seguir adelante y eliminar?" → Sí.
- **Acción que "no hace nada"**: mirar `aria-haspopup="true"` (es un grupo de menú: la acción real está dentro, p. ej. "Revertir" → "Revertir mov...") y `aria-disabled="true"` + `title` (está deshabilitada y la ayuda dice por qué). Leerlo antes de hacer clic: un clic sobre un botón deshabilitado agota los 30 s de espera.
- Informes por URL: `?company=X&report=<id>` abre la ventana de opciones como diálogo (795 ajuste coste, 5692 calcular amortización); al terminar BC vuelve a la página de inicio o muestra un diálogo final.
- Leer filas de una cuadrícula de líneas: la fila seleccionada tiene `input` y las demás solo texto; un lector que filtra por contenido puede devolver solo una fila (el diario A/F mostraba 1 de 2). Si el número de filas importa, contar `tbody tr` o confirmar con captura.
- Tras "Registrar envío..." puede saltar `beforeunload` y cortar el script (se pierde el resultado aunque el registro se haya hecho): `browser_handle_dialog(accept)` y verificar en datos (38 / 142).
- Configuración que se descubre al probar: página editable de empleados de almacén = **7328** (con acción "Agregarme como empleado de almacén"); 7348 es solo lectura. Recepción almacén: lista 7332, ficha 5768, acción "Registrar recep.". Transferencia: ficha 5740, campos "Transfer. desde-cód." / "Transfer. a-cód."; registro con opciones "Enviar" / "Recibir".

**Librería QA (lo más eficiente, comprobado 17/11/2026)**: `scripts/qa-lib.js` + `scripts/qa-run.sh`. Copiarlos a `%USERPROFILE%\bc-browser`, poner la URL base (`.../<entorno>?company=<empresa>`) en `qa-base.txt`, escribir solo el cuerpo de la tarea (`./qa-run.sh <<'EOF' ... EOF`) y ejecutar `browser_run_code_unsafe(filename: '<...>/playwright-output/run.js')`. `require` NO funciona en `run_code`; por eso se ensambla en un fichero. Funciones: `L.open(pagina, extra)` (neutraliza `beforeunload` antes de navegar), `L.read(pagina, filtro)` (lista con cabeceras), `L.set(scope, /regex/, valor)` (fill + Tab, sin clic → no le afectan los globos de ayuda), `L.lines()`, `L.expandLines()` (pestaña Líneas plegada en abonos), `L.columns(grid)` (nombres reales de columnas), `L.post(opcion)` (responde Sí a confirmaciones "¿...?" y No a "¿abrir registrado?"; devuelve el log de diálogos y errores de la 700), `L.tracking([[/^Nº lote$/, 'L'], [/^Cantidad \(base\)$/, 10]])`, `L.dialogs()`, `L.answer([...])`, `L.err700()`.
- **`beforeunload` resuelto**: `window.onbeforeunload = null` antes de `page.goto` (lo hace `L.open`). `page.on('dialog')` dentro del script NO lo captura (lo intercepta el MCP).
- **`mode=create`** funciona en fichas y documentos: 21/26/30 (con plantilla), 42 pedido venta, 50 pedido compra, 51 factura compra, 52 abono compra.
- Nombres reales: tipo de línea **"Artículo"** (no "Producto"); columnas "Cantidad a enviar" pero "Cant. a facturar" → listar con `L.columns` antes de suponer. Documento compra: `Nº factura proveedor` / `Nº abono proveedor`.
- Acciones de menús secundarios (p. ej. "Envío directo › Obtener pedido de venta") no existen en el DOM hasta desplegar su grupo; **Alt+Q** abre "Dígame qué desea hacer" (textbox `Dígame qué desea hacer.`) pero su "Mostrar todos" no se despliega con clic → buscar otra vía o personalizar.
- La página 700 "Mensajes de error" se abre **encima** del documento: leerla buscando la cuadrícula con "Acción recomendada" (`L.err700()`), no la primera.
- Listas vacías se abren en solo lectura (sin fila editable); `mode=edit` en listas no lo resuelve.
- La sesión de BC caduca tras ~1 h de uso intensivo → vuelve a pedir login + MFA.

**Fragmentos de código listos para usar** (leer listas, crear fichas con plantilla, diario con lote y registro): `references/snippets.md`. Usarlos antes de improvisar: ahorran muchos intentos.

**Lectura rápida de datos sin capturas (comprobado 17/11/2026)**: `browser_evaluate` sobre `document.querySelector('iframe').contentDocument` lee la cuadrícula: la PRIMERA `[role=grid]` es la lista principal (en tabla o en mosaico); las demás son paneles laterales que muestran "(No hay nada que mostrar en esta vista)" mientras cargan → no usar ese texto de todo el documento para decidir que está vacío. Esperar a que la primera cuadrícula no diga "Cargando/Recuperando". Con `browser_run_code_unsafe` se pueden recorrer varias páginas por URL en un solo paso (3-4 s por página).
**Trampas al automatizar navegación**:
- Salir de una **ficha** (card) o de una lista con un filtro de URL no válido dispara el diálogo `beforeunload`, que bloquea el script en curso y pierde su resultado → no mezclar fichas en recorridos en bloque; tras el aviso, `browser_handle_dialog(accept)`.
- **No usar `<>` en filtros de URL** (`'Campo' IS '<>'''` falla). "No vacío" = `'?*'`.
- Las herramientas del navegador lanzadas en paralelo en un mismo mensaje NO se ejecutan en orden: una captura puede salir antes que la espera. Encadenar en mensajes distintos o dentro de un `run_code`.
- Si un resultado incluye datos de otra página (p. ej. productos en una lista de clientes), es lectura obsoleta: descartarlo.
- `browser_wait_for(textGone)` sí detecta los mensajes de estado de BC ("Creando nueva empresa...", "El informe se está procesando").
- Copiar una empresa demo (CRONUS ES) tarda ~90 s.

Selectores estables (no dependen de refs que cambian): `iframe >> nth=0 >> internal:control=enter-frame >> internal:role=button[name="Lanzar"s]`, `... internal:role=menuitem[name="Línea"s] >> nth=-1` (el último = el del subformulario de líneas), `... internal:text="Líns. seguim. prod."s`. Si `browser_evaluate` sobre un ref devuelve vacío, el ref está obsoleto: hacer captura y volver a localizar.

Flujo probado de factura de venta hasta registrar: lista 9301 → Nuevo → nº cliente en "Nombre del cliente" + Tab → línea: Nº (lookup) → Cód. almacén sin envío obligatorio → Cantidad + Tab → ArrowDown → (lote si aplica) → Lanzar → Registrar → Sí (en el diálogo) → "Sí" para abrir la registrada.

Regex útiles para `browser_find`:
- Controles editables: `/combobox "Nº"|textbox "Cantidad"/`
- Errores: `/dialog "[^"]*"/`
- Botones de acción: `/menuitem "Nuevo"|menuitem "Registrar"/`
- Estado edición: `/Realizar cambios en la página|Abrir la página en modo de solo lectura/`

**Power Apps (canvas) conectadas a BC (comprobado 17/11/2026)**:
- Ir SIEMPRE al entorno de Power Platform que indica el usuario (el login deja en el entorno por defecto). Cambio de entorno: botón "Entorno" → lista lateral.
- **Leer fórmulas**: Studio → menú desplegable junto a Guardar → "Descargar una copia" → el `.msapp` es un ZIP con `Src/*.pa.yaml` (todas las fórmulas legibles) y `References/DataSources.json` (conector, empresa). Mucho más fiable que leer la barra de fórmulas control a control. Sirve también como copia de seguridad antes de cambiar y para hacer `diff` y confirmar que el único cambio es el deseado.
- **Editar una fórmula**: buscar el control en el árbol (cuadro "Buscar"), seleccionarlo, clic en la barra de fórmulas, `Ctrl+A` + `keyboard.insertText(...)` (en configuración española los separadores son `;`). Diálogos "Bienvenido"/"¿Sabía que…?" se tragan el texto: cerrarlos antes.
- La barra del Studio cambia de posición según el ancho y el estado (botón "Publicar" con texto o solo icono): localizar botones por rol/nombre en el iframe `authoring...`, no por coordenadas fijas. Al pulsar Publicar el Studio guarda una versión aunque se cancele.
- Studio en "solo lectura": otra sesión (también la propia anterior) tiene el bloqueo; se libera en unos minutos.
- **Probar en la app publicada**: aparecen avisos "Se acerca una nueva versión" y "Está usando una versión anterior… [Actualizar]". Pulsar Actualizar por nombre (`getByRole('button',{name:'Actualizar'})`, su posición cambia si hay dos avisos) y comprobar que el aviso ya no está ANTES de dar por buena una prueba. La vista previa del Studio (▷) sirve para probar sin publicar, con los datos reales de ese entorno.
- Capturar lo que la app pide a BC: `page.waitForResponse(r => r.url().includes('/tables/<entidad>/items'))` → ver si hay `$filter`, cuántas filas, Ids nulos/duplicados.

## 4. Seguridad de datos

- Antes de registrar, lanzar, eliminar o enviar documentos, confirmar con el usuario salvo que lo haya pedido explícitamente.
- Comprobar el entorno (`Entorno: <nombre>` en la cabecera) antes de crear datos: no crear datos de prueba en Production sin permiso explícito.
- Al terminar, informar de los documentos creados (nº, empresa, entorno) para que se puedan limpiar.

## 5. Ampliar esta skill

**Obligatorio (petición del usuario):** al terminar cada sesión de pruebas, añadir aquí todo lo aprendido nuevo, sin esperar a que lo pida, y decirle en una línea qué se ha añadido. Cuando en una sesión se descubra un comportamiento nuevo de BC (otro conmutador, un lookup distinto, una URL útil, un atajo comprobado), añadirlo aquí en la sección correspondiente. Los atajos de teclado (`Alt+N` nuevo, `Ctrl+Alt+F2`...) deben probarse antes de documentarlos como fiables.

- **Dataset de un report en XML con `bc-en-vivo` (comprobado 18/11/2026, el método más rápido)**: `bc_ejecutar_escritura` con `bc.abrir({report:N})`; el diálogo vive en el frame de BC (`page.frames().find(f => f !== page.mainFrame() && /businesscentral/.test(f.url()))`; `page.getByRole('dialog')` NO lo ve). Filtro: `getByRole('combobox',{name:'Nº',exact:true}).fill(..)`+Tab (son combobox, no textbox) → "Enviar a..." → diálogo "Elija el tipo de archivo..." → "Documento XML" → Aceptar con `page.waitForEvent('download')` + `saveAs(scratchpad)`. El XML trae `<Column name=..>valor</Column>`: leer con grep/sed. Imagen vacía = columna sin contenido. Sin filtro por documento exporta todos los del filtro de proveedor (útil para localizar un nº).
- Filtro de lista por campo ausente en la ficha: si una ficha registrada no muestra un campo (p. ej. términos de pago en la 132), filtrar la lista (143) con `'Payment Terms Code' IS 'X'` dice qué documentos lo tienen. Idem `'Language Code' IS ''` / `'?*'` para saber si hay idioma informado. `bc.expandir` puede colgar >120 s: evitar.
- `bc-api.ps1` apunta a un tenant concreto (bcapi.json): no vale para otros clientes.
