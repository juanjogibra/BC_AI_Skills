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
- Navegador: comprobar que vive (`/json/list` con tiempo límite) antes de la sesión. La sesión de BC caduca a ~1 h de uso intensivo: agrupar el trabajo de interfaz.
- Crear datos propios (`QA-...`) antes que buscar cuáles de la demo encajan.

## 8. Medir y mejorar
- Si una rutina tarda notablemente, medirla (`Stopwatch`, `time`) y buscar la causa: espera fija, ida y vuelta innecesaria, lectura de más, falta de filtro.
- Anotar aquí cada mejora comprobada (qué, cuánto ahorra, fecha). Corregir lo que resulte falso.

## Lo que NO se sacrifica por velocidad
- Leer las **notificaciones antes de registrar** (`L.post` lo hace y aborta si hay un aviso crítico) y la **lista previa al registro** de `bc-qa/references/patrones.md` 0a (cantidades a enviar/recibir/facturar, exigencias del almacén). Predecir el resultado leyendo es más rápido que registrar y que recuperarse de una página 700 que se abre encima y deja el documento inerte (los clics fallan con "element is inert").
- **Fail-fast**: si falla una precondición, parar; nunca seguir hasta registrar.
- **Verificar en datos** (movimientos), no en "no dio error" ni en lo que muestra la pantalla.
- Casos desfavorables: son baratos (no registran) y se incluyen siempre.
- Confirmación del usuario antes de acciones irreversibles fuera de lo pedido, y nunca Production sin permiso.
