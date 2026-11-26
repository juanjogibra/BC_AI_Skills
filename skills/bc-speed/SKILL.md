---
name: bc-speed
description: Velocidad y economía de tokens en pruebas y verificaciones de Business Central SIN comprometer la calidad. Usar junto con bc-ui-testing y bc-qa en cualquier prueba, verificación, reproducción de incidencia o recorrido por BC (interfaz o API) - solapar esperas con la preparación del paso siguiente, sondear en vez de esperar fijo, agrupar pasos, verificar por API, evitar bloqueos. Leerla antes de empezar una sesión de pruebas y al detectar lentitud.
---

# Pruebas BC rápidas sin perder calidad

Objetivo: el mismo nivel de evidencia en menos tiempo y menos tokens. **La velocidad nunca justifica saltarse una comprobación**: ver "Lo que NO se sacrifica" al final.

## 1. Solapar: aprovechar cada espera para preparar el siguiente paso
BC tarda en cargar páginas (3-15 s), registrar (5-15 s) y ejecutar informes/procesos (segundos a minutos). Ese tiempo se usa:
- **En el mismo mensaje, llamadas independientes en paralelo**: mientras se lanza una acción en el navegador, escribir ya el script del paso siguiente (`qa-run.sh` genera `run.js`) y la consulta de verificación por API. Solo si NO dependen entre sí; si dependen, encadenar.
  - Ojo: dos herramientas del navegador en el mismo mensaje no van en orden. Nunca generar `run.js` en paralelo con la llamada que lo ejecuta (podría ejecutar el anterior: por eso `qa-run.sh` lo borra antes).
- **Procesos largos en segundo plano** (`run_in_background`): consultas API grandes, extracciones de código (`Expand-ALSource`), descargas de símbolos, generación de informes. Mientras corren, seguir con la interfaz o preparar el informe de resultados.
- **Dentro de un `run_code`**: lanzar la acción y, mientras BC procesa, ir sondeando su estado y recogiendo lo que ya está disponible (título, notificaciones, diálogos) en lugar de esperar a ciegas.
- **Despliegues en varios entornos (consejo del usuario, 26/11/2026)**: tras pulsar "Implementar" en un entorno (2508 "En curso"), pasar al siguiente y lanzar su subida, rotando por todos los entornos que haya. Después sondear la 2508 de cada uno y despublicar o verificar solo los que estén en "Completado". Nunca uno detrás de otro esperando.
- **Pensar mientras carga**: decidir la verificación esperada (movimientos, importes) antes de que termine el registro, para comparar al instante.

## 2. Sondear, no esperar fijo
- Esperas fijas solo como mínimo técnico (≤1-2 s). Para el resto, **bucle de sondeo corto** (300-1000 ms) con condición de salida: título cambiado, diálogo presente, cuadrícula sin "Cargando/Recuperando", "No guardado" desaparecido. `L.open` y `L.read` ya lo hacen.
- `browser_wait_for(text)` no ve el iframe de BC (agota el tiempo). Sí funciona `textGone` para mensajes de estado ("Guardando", "El informe se está procesando").
- Fin de un informe o proceso: BC vuelve a la página de origen o muestra un diálogo final. Sondear eso, no dormir 60 s.

- **Esperar por el diálogo con nombre**, no por "hay algún diálogo": `getByRole('dialog', {name: /^Calcular plan/})` + sondeo hasta 20 s. Con el servidor lento, "hay diálogo" da falsos positivos (globos, avisos) y el paso siguiente falla a los 30 s.
- **Servidor lento ("Guardando..." largo)**: no repetir la acción; sondear el resultado (título, campo). Repetir crea documentos duplicados.

## 3. Agrupar: muchas cosas por llamada
- **Librería cargada una vez** (`load.js` → `page.__qa`) y tareas de 200-1000 bytes con `qa-run.sh` (−95 % de tokens frente a mandar el script entero).
- Un solo `run_code` para una secuencia completa: abrir, rellenar, notificaciones, registrar, leer resultado. Cada ida y vuelta con el modelo cuesta más que varios pasos dentro del script.
- Un registro, muchas comprobaciones: diseñar el caso para verificar cabecera, líneas, registrado y todos los movimientos de una vez.
- API: `$filter` + `$select` (solo los campos necesarios) + `$top`; una consulta por tabla, todas en un único comando.

## 4. Verificar por API, no por pantalla
- Movimientos y registrados por API (inventario y tabla origen: `bc-ui-testing/references/apis-estandar.md` y `apis-tablas.md`): segundos, sin capturas, sin riesgo de lectura obsoleta.
- Tomar la **base antes de actuar** (último nº de movimiento de contabilidad, producto, valor) y después filtrar `entryNumber gt <base>`: se ve exactamente lo que generó la prueba y nada más.
- Las queries de `microsoft/analytics` NO admiten `$orderby` (501): filtrar por fecha o por nº.
- Interfaz solo para lo que no tiene API (movs. A/F, banco, Cartera, servicio, registro C/G, mensajes de error) o para comprobar lo que ve el usuario.

## 5. Descubrir antes de actuar (evita el ensayo y error)
- **Primero el catálogo, después la pantalla** (`%USERPROFILE%\bc-catalog\<versión>\`, ver bc-qa): `acciones.tsv` da el nombre ES exacto, el grupo de menú y la pestaña de cualquier acción estándar (p. ej. 99000852 "Calc. planif. regenerativa" → pestaña Preparar; 291 "Traer pedidos venta" → grupo Envío directo). `errores.tsv` explica un error sin reproducirlo. Comprobado 19/11/2026: los 5 casos que costaron 10+ intentos de descubrimiento en pantalla salen del catálogo con un `Grep`.
- **`L.preflight({item, customer, vendor, location})`** antes de cada circuito: lee fichas + configuración de existencias y contabilidad y devuelve avisos interpretados (Tipo, Reserva, política, Cód. compra, seguimiento, bloqueos, exigencias del almacén, inventario negativo, ajuste de coste, fechas permitidas). Incluirlo en el encargo de `bc-tester`. Validado 19/11/2026 (2 ejecuciones idénticas; 50-60 s con producto + cliente + proveedor + almacén, unos 25 s solo con producto). `L.readCard(página, filtro, camposClave)` sondea hasta que aparecen los campos clave; si alguno no aparece, el preflight avisa "LECTURA INCOMPLETA" en lugar de callar (con espera fija de 1,8 s se perdían campos de pestañas plegadas de forma intermitente). Pasar solo las fichas que el circuito usa: cada una cuesta unos 8-10 s.
- `L.fields(/re/)`, `L.acts(/re/)`, `L.columns(grid)` antes de suponer nombres de campos, acciones o columnas.
- Fragmentos probados (`bc-ui-testing/references/snippets.md`) antes de improvisar.
- **Estado de un botón antes de pulsarlo**: `aria-disabled` + `title` dicen si está deshabilitado y por qué; `aria-haspopup` indica un grupo de menú. Evita esperas de 30 s y da el motivo sin ejecutar (comprobado 18/11/2026: "Revertir mov..." deshabilitado en un asiento ya revertido).
- **Predecir y no ejecutar**: si el resultado de un caso desfavorable se deduce leyendo (cantidades a 0, botón deshabilitado, configuración), anotarlo como demostrado sin ejecutarlo.
- Comprobar precondiciones de datos y configuración por API o lectura antes de montar el caso (stock en el almacén, empleado de almacén, series, fechas permitidas).

## 6. Mínimo de tokens
- Nada de `browser_snapshot` completo (>90k caracteres). `browser_find`, lectura del iframe o captura puntual.
- `L.read(..., max)` y `$top` siempre; filtrar en origen, no después.
- Capturas solo cuando aportan evidencia (diálogo, error, totales) o para desatascar.
- Inventarios y listados grandes a fichero (md/csv/xlsx) y resumir en el chat.

## 7. No quedarse atascado
- **Límite de tiempo por obstáculo**: tras 2-3 intentos fallidos, valorar si merece la pena; si no, tomar la vía simple o saltar y avisar en una línea.
- **Toda llamada de red con tiempo límite** (`-TimeoutSec`, `curl --max-time`, `timeout N`). Una llamada sin límite puede bloquear la sesión entera.
- **Si PowerShell deja de responder** (ni `'hola'` termina; comprobado 18/11/2026): no insistir ni encadenar más comandos PowerShell. Probar la red con `curl` desde Bash para separar red y shell, detener las tareas en segundo plano colgadas y seguir por Bash/Node o por la interfaz. Se recuperó solo al rato; mientras tanto se avanzó por la interfaz sin perder tiempo. Desde Bash: `timeout 60 powershell -NoProfile -ExecutionPolicy Bypass -Command ". .\bc-api.ps1; ..."` (sin Bypass no carga `bc-api.ps1`).
- Navegador: comprobar que vive (`/json/list` con tiempo límite) **y que la URL de la pestaña es de businesscentral.dynamics.com, no de login.microsoftonline.com**, ANTES de delegar en `bc-tester` (comprobado 19/11/2026: el subagente arrancó para nada porque la sesión había caducado). Si pide login: `start-bc-browser.ps1 -Restart -Visible` y que el usuario inicie sesión. La sesión de BC caduca a ~1 h de uso intensivo: agrupar el trabajo de interfaz. **Una pestaña en `businesscentral.dynamics.com/` sin tenant NO prueba que la sesión valga para el tenant del cliente** (comprobado 26/11/2026: con otro tenant activo, navegar a `<tenant cliente>/<entorno>?page=2500` mandó al selector de cuentas). Antes de delegar, navegar de verdad a `<tenant>/<entorno>` y comprobar que no acaba en login.microsoftonline.
- **Ventana de Chrome tapada = clics colgados** (comprobado 19/11/2026, costó ~12 min por kata): con la ventana oculta la página no se pinta y Playwright espera "stable" sin fin. `L.ensureVisible()` (lo llaman `L.open` y `L.clk`) la restaura si está minimizada, pero NO destapa una ventana maximizada tapada por otra: arrancar Chrome con los flags anti-ocultación de `start-bc-browser.ps1` o dejarlo encima. Medido en katas: 27-40 min → 19 min con la ventana visible y la librería corregida.
- Crear datos propios (`QA-...`) antes que buscar cuáles de la demo encajan.

- Commits del backup: escribir el mensaje en un fichero desde Bash (heredoc) y `git commit -F <fichero>`. En PowerShell 5.1 un mensaje con comillas dobles se parte en varios argumentos y el commit falla.

## 8. Medir y mejorar
- Si una rutina tarda notablemente, medirla (`Stopwatch`, `time`) y buscar la causa: espera fija, ida y vuelta innecesaria, lectura de más, falta de filtro.
- Anotar aquí cada mejora comprobada (qué, cuánto ahorra, fecha). Corregir lo que resulte falso.
- **Bucle con `bc-tester`**: delegar siempre con la plantilla `bc-qa/plantillas/encargo-bc-tester.md` (el encargo completo evita idas y vueltas). Su informe trae "Qué me frenó" (tiempo por caso, intentos fallidos, causa) y "Predicciones fallidas": revisarlos y pasar lo comprobado aquí (velocidad) o a `bc-qa/references/patrones.md` (criterio).

## Lo que NO se sacrifica por velocidad
- Leer las **notificaciones antes de registrar** (`L.post` lo hace y aborta si hay un aviso crítico) y la **lista previa al registro** de `bc-qa/references/patrones.md` 0a (cantidades a enviar/recibir/facturar, exigencias del almacén). Predecir el resultado leyendo es más rápido que registrar y que recuperarse de una página 700 que se abre encima y deja el documento inerte (los clics fallan con "element is inert").
- **Fail-fast**: si falla una precondición, parar; nunca seguir hasta registrar.
- **Verificar en datos** (movimientos), no en "no dio error" ni en lo que muestra la pantalla.
- Casos desfavorables: son baratos (no registran) y se incluyen siempre.
- Confirmación del usuario antes de acciones irreversibles fuera de lo pedido, y nunca Production sin permiso.
- **Datos masivos por API (25/11/2026)**: un pedido con 40 líneas se crea en ~1 min con POST a `salesOrderLines` en vez de rellenar la cuadrícula. Úsalo para pruebas de documento largo o paginación.
- **Reutilizar documentos ya registrados en los retest**: si la corrección es solo de informe o de presentación, el encargo debe pedir que se reimpriman los documentos de las rondas anteriores (con sus números), sin registrar nada nuevo. En la ronda 3 del albarán valorado bajó el retest de unos 65 min a un objetivo de 30.
- **Antes de lanzar `bc-tester`**: comprobar la versión del `.app` frente a la publicada (subir una versión repetida bloquea el Paso 0) y listar las pestañas. Sus índices cambian si el usuario abre otras, así que hay que indicar la pestaña de trabajo por URL y no por índice.
- **Chrome compartido con otras sesiones** (25/11/2026): si otra sesión usa el mismo navegador, `bc-tester` debe trabajar en su propia pestaña, abierta con la URL del entorno, y llamar a `ensureVisible` al principio de cada script. Con la ventana oculta, `screenshot` agota el tiempo de espera y algunos clics devuelven éxito sin hacer nada. En el encargo hay que indicar la pestaña por URL, nunca por índice.
- **Rondas de reprueba acotadas**: tras un cambio de arquitectura, una ronda de regresión que reimprime los documentos de las rondas anteriores (10 casos en unos 35 min) y después rondas cortas solo con lo que cambia (unos 15-25 min). Es mucho más barato que repetir toda la batería.
- **Reprueba de un arreglo de presentación**: Paso 0 de la PTE más 3 o 4 documentos ya registrados, leyendo el PDF con `pdftotext -raw` y sin capturas salvo que algo falle. Se hizo en unos 6 min (ronda 8). Al encargarla, dar un límite realista (unos 12 min), no uno genérico de 25.
