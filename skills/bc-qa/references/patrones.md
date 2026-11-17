# Patrones: anticipar problemas y probar con el mínimo coste

Catálogo vivo. Cada vez que una prueba, revisión o incidencia revele un patrón nuevo (o confirme uno), añadirlo o marcarlo con la fecha y el contexto. Es lo que convierte la experiencia en criterio.

## A. Problemas transversales que buscar SIEMPRE en un desarrollo
Revisarlos al leer el código (antes de ejecutar nada): detectarlos leyendo cuesta minutos; descubrirlos en producción, días.

| # | Patrón | Cómo se detecta | Síntoma típico |
|---|---|---|---|
| T1 | Campo de cabecera/línea que no llega al registrado | tableextension en `Sales Header` sin la misma ID de campo en `Sales Invoice Header`/`Sales Shipment Header`/`Sales Cr.Memo Header`/archivo (`TransferFields`) | Campo vacío en factura registrada o en archivo |
| T2 | Lógica en la página en vez de en la tabla | `OnValidate`/`OnAction` de pageextension con lógica de negocio | Funciona a mano, falla vía copiar documento, API, paquetes de configuración, cola de proyectos |
| T3 | Interfaz en el camino de registro | `Confirm`/`Message`/`RunModal` en suscriptores de registro sin `GuiAllowed` | Falla en registro en segundo plano / en lote / API |
| T4 | `Commit` dentro del registro o de un evento | `Commit()` en suscriptores de `OnBefore/OnAfterPost...` | Registros a medias si algo falla después |
| T5 | Solo contempla factura | Código sin filtrar ni tratar `Document Type` (abono, devolución, pedido) o signo | Abonos con signo o importes incorrectos |
| T6 | Importes en divisa vs DL | Uso de `Amount` donde debería ser `Amount (LCY)` o viceversa | Descuadres solo con clientes en divisa |
| T7 | Precios IVA incluido | Cálculos sobre `Unit Price` sin mirar `Prices Including VAT` | Importes inflados o IVA doble |
| T8 | Parciales | Uso de `Quantity` donde toca `Qty. to Ship`/`Qty. to Invoice` | Falla al enviar o facturar en varias veces |
| T9 | Datos anteriores al cambio | Campo nuevo sin valor en registros existentes, sin Upgrade codeunit | Errores o vacíos solo en documentos antiguos |
| T10 | Permisos | Tabla/objeto nuevo fuera del permissionset; probado solo con SUPER | "No tiene permiso..." a usuarios reales |
| T11 | Filtros/estado del Rec del llamador | Suscriptor que hace `SetRange`/`Modify` sobre el `Rec` recibido por var | Efectos raros en el proceso estándar posterior |
| T12 | Borrado y renombrado | Tabla propia ligada a cliente/producto/documento sin limpiar en `OnDelete`/`OnRename` | Registros huérfanos, claves rotas |
| T13 | Rendimiento | `CalcFields`/bucles `FindSet` en `OnAfterGetRecord` de listas, consultas sin clave | Listas lentas, bloqueos al registrar |
| T14 | Localización ES | No contempla Cartera (efectos: movs. cliente tipo Efecto), SII, recargo de equivalencia, IVA no sujeto | Funciona en W1/CRONUS, falla en el cliente |
| T15 | Dimensiones | No propaga `Dimension Set ID` o crea movimientos sin dimensiones obligatorias | Error de dimensiones al registrar o analítica incompleta |
| T17 | Corrección/cancelación de documentos ya consumidos | Desarrollo o proceso que anula compras/ventas registradas | BC impide corregir una factura de compra cuya mercancía ya se vendió (mensaje engañoso "se ha devuelto"); hay que devolver solo lo pendiente |
| T18 | Abonos sin liquidar | Abono de compra creado a mano (no "Corregir") | Factura y abono quedan ambos abiertos → saldos y vencimientos inflados hasta liquidar |
| T19 | Configuración de usuario de almacén | Almacén con requerimientos sin empleado de almacén | No se pueden abrir recepciones/envíos de almacén |
| T16 | Multiempresa / fechas | Datos por empresa, `WorkDate` vs `Posting Date`, fechas de registro permitidas | Falla solo en otra empresa o en otra fecha |
| T20 | Importación desde Excel (Excel Buffer) | (a) El Excel del usuario trae hipervínculos con URI no válida (p. ej. `mailto:a@x.com;b@x.com`, que Excel crea al escribir varios correos en una celda); (b) filas "vacías" con solo espacios o restos de formato; (c) cabeceras escritas distinto a las del `case` | (a) `WorkbookReader.SheetNames ... Cannot access a disposed object 'DeflateStream'` antes de leer nada (el mensaje engaña: no es el stream); (b) líneas basura importadas (p. ej. tipo por defecto, sin nº documento); (c) la columna se ignora sin avisar. Probar siempre con el Excel REAL del usuario, no con uno hecho a mano |

## B. Economía de pruebas (máxima confianza, mínimo tiempo)
1. **Leer antes de ejecutar**: lo que el código decide de forma determinista (un campo asignado, un filtro) se valida leyendo; ejecutar solo lo que necesita evidencia en tiempo de ejecución (registro, movimientos, interfaz).
2. **Por riesgo, no por exhaustividad**: el conjunto mínimo de casos que cubre los riesgos Altos. Combinar variables por parejas, no todas con todas.
3. **Un caso base que pase y variar una cosa cada vez**: si falla, se sabe por qué sin investigar.
4. **Muchas comprobaciones por ejecución**: un documento registrado permite verificar cabecera, líneas, registrado, movimientos y campo nuevo de una vez. Diseñar los casos para que cada registro valga para varias aserciones.
5. **El caso de mayor riesgo, primero**: si falla o se bloquea por configuración, parar y avisar en lugar de seguir ejecutando casos que ya no aportan.
6. **Los negativos son baratos** (no registran nada): incluirlos siempre.
7. **Reutilizar datos** de la ficha del cliente; crear solo lo imprescindible y apuntarlo.
8. **"Find entries" primero**: dice qué tablas tienen movimientos; abrir solo esas.
9. **Regresión proporcional**: un cambio visual no necesita regresión de registro; un cambio en el registro sí.
10. **Preguntas agrupadas**: si falta información, pedirla toda de una vez al principio.
0. **Leer las NOTIFICACIONES antes de registrar (regla del usuario, obligatoria)**: la barra de notificaciones de BC avisa antes de que algo crítico falle o salga mal (stock insuficiente en la ubicación, límite de crédito, saldo vencido, cliente bloqueado, validaciones). Leerla siempre antes de lanzar/registrar; si avisa de algo crítico, parar y analizar (suele ser un dato de prueba mal preparado o el propio hallazgo). `L.post()` lo hace y aborta si detecta un aviso crítico (forzar con `L.force = true` solo si el caso lo exige).
0b. **Fail-fast**: si una precondición del caso falla (campo que no se rellena, dato que no existe), PARAR; nunca capturar el error y seguir hasta registrar.
11. **Límite de tiempo por obstáculo (regla del usuario)**: si un paso se resiste (2-3 intentos fallidos), preguntarse si merece la pena para el conocimiento. Si NO, saltar al siguiente apartado o tomar la vía simple (p. ej. crear datos propios en lugar de seguir investigando cuáles existen). Avisar al usuario en una línea.
12. **Crear antes que descubrir** en datos de prueba: datos propios con prefijo reconocible (`QA-...`) son más rápidos y predecibles que buscar cuáles de la demo encajan.

## C. Revisión de incidencias eficiente
1. **Triaje de una sola vez**: texto literal del error, entorno/empresa, usuario, nº de documento, desde cuándo pasa y qué cambió (instalación de extensión, configuración, datos).
2. **Buscar el texto del error en el código antes de reproducir** (desarrollo + Base App): localiza el objeto y la condición en minutos y dice qué dato o configuración la dispara.
3. **¿Qué cambió?**: versiones en página 2500/2508, registro de cambios, configuración reciente.
4. **Aislar con una variación**: otro usuario (permisos), otro documento/cliente/producto (datos), otra empresa (configuración), sin la extensión (personalización).
5. **Reproducir en sandbox**, nunca en Production.
7. **Errores al leer un fichero (xlsx/zip/xml)**: inspeccionar el fichero real (un .xlsx es un ZIP: listar entradas, leer `workbook.xml`, `_rels`, `sharedStrings`) y crear variantes quitando UNA parte cada vez (hipervínculos, etiqueta de confidencialidad, hojas...). Subir cada variante aísla la causa en 2-3 importaciones sin tocar código.
6. **Solución mínima**: corregir la causa, no el síntoma; proponer además la prueba que evita que vuelva y añadir el patrón aquí si es nuevo.
