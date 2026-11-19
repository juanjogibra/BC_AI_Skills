# Patrones: anticipar problemas y probar con el mínimo coste

Catálogo vivo. Cada vez que una prueba, revisión o incidencia revele un patrón nuevo (o confirme uno), añadirlo o marcarlo con la fecha y el contexto. Es lo que convierte la experiencia en criterio.

## A. Problemas transversales que buscar SIEMPRE en un desarrollo
Revisarlos al leer el código (antes de ejecutar nada): detectarlos leyendo cuesta minutos; descubrirlos en producción, días.

**Cuándo (obligatorio)**: (1) al **diseñar**, antes de escribir AL, recorrer la tabla y resolver en el diseño cada patrón que aplique; (2) al **terminar el código**, pasar A0 antes de BCQuality y antes de compilar el .app de pruebas. Un patrón que se descubre en las pruebas es un fallo de este paso (caso real 18/11/2026: T24 apareció al registrar en PRE, tras implementar, compilar y revisar).

### A0. Comprobación mecánica tras escribir el código (1-2 min, Grep sobre los objetos cambiados)
| Buscar | Si aparece | Patrón |
|---|---|---|
| `Modify`/`Insert`/`Delete`/`ModifyAll` sobre tablas de registrados o movimientos (`Sales Shipment Header`, `Sales Invoice Header`, `Sales Cr.Memo Header`, `Purch. Rcpt. Header`, `Purch. Inv. Header`, `Return Receipt Header`, `*Ledger Entry`, `Posted *`) | El objeto debe llevar `Permissions = tabledata "<tabla>" = rm/rim...` (licencia: solo indirecto). El permissionset no basta | T24 |
| `Commit(` en suscriptores o codeunits de registro | Justificarlo o quitarlo | T4 |
| `Confirm(`/`Message(`/`Page.RunModal`/`Report.RunModal` en el camino de registro | Proteger con `GuiAllowed` o sacarlo del registro | T3 |
| Bucle `FindSet ... repeat` sobre líneas que escribe en la cabecera o en otro documento | ¿Una vez por documento o por línea? Deduplicar | T23 |
| `EventSubscriber` a un proceso de registro/almacén | ¿Es el flujo que usa el cliente? ¿Hay otros caminos (picking de inventario, envío de almacén, registro directo, en lote)? | T23 |
| Campo nuevo en tabla origen con `TransferFields` a registrado | Mismo ID, tipo y longitud en el destino | T1 |
| `SetRange` sobre el `Rec` recibido por `var` | No dejar filtros al llamador | T11 |

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
| T20 | Importación desde Excel (Excel Buffer) | (a) El Excel del usuario trae hipervínculos con URI no válida (p. ej. `mailto:a@x.com;b@x.com`, que Excel crea al escribir varios correos en una celda); (b) filas "vacías" con solo espacios o restos de formato; (c) cabeceras escritas distinto a las del `case` | (a) `WorkbookReader.SheetNames ... Cannot access a disposed object 'DeflateStream'` antes de leer nada (el mensaje engaña: no es el stream); (b) líneas basura importadas (p. ej. tipo por defecto, sin nº documento); (c) la columna se ignora sin avisar. Probar siempre con el Excel REAL del usuario, no con uno hecho a mano. Arreglo comprobado para (a): reconstruir el xlsx con `Data Compression` (abrir en lectura + `CreateZipArchive` nuevo copiando entradas y quitando de `xl/worksheets/_rels/*.rels` las `<Relationship>` de tipo hyperlink); el modo Update (`OpenZipArchive(..., true)`) NO funcionó |
| T21 | Clave propia (Guid `Id`) como clave OData | Campo Id asignado solo si está vacío o en un evento concreto; registros creados con `TransferFields` (líneas derivadas de transferencia, copiar documento) o sin pasar por ese evento (líneas de comentario) | En Power Apps/integraciones salen líneas repetidas o se modifica la línea equivocada; comprobar Ids nulos/duplicados en la respuesta del servicio |
| T22 | Power Apps + conector BC on-premise | El conector `dynamicssmbonprem` rechaza `$filter` (`eq`, `startswith`: "is not allowed"); las apps filtran en local sobre las primeras N filas (límite de filas de datos, máx. 2000) | Pedidos sin líneas cuando el servicio devuelve más de N filas; no "arreglar" la delegación con `eq` (rompe la app); reducir el volumen en origen o vigilar el recuento |
| T23 | Desarrollo enganchado a un solo flujo de almacén | Suscriptor solo en `Whse.-Post Shipment` (envío de almacén) cuando el almacén usa picking de inventario (`Whse.-Activity-Post`, evento `OnAfterPostSourceDocument`, albarán = `SalesHeader."Last Shipping No."`) o registro directo del pedido; o al revés. Preguntar qué flujo usa cada almacén (ficha 14: Requiere envío/picking) | "No funciona en PRE / no sé probarlo": el código existe pero no se ejecuta. Además, copiar datos a registrados recorriendo líneas en vez de documentos distintos duplica comentarios (una copia por línea) |
| T24 | Modificar documentos registrados sin permiso indirecto | Codeunit propio que hace `Modify` en tablas de registrados (110/112/114/120/122/124, `Sales Shipment Header`...) sin la propiedad `Permissions = tabledata "<tabla>" = rm` en el propio objeto. El permissionset NO basta: la **licencia** solo permite Modify indirecto (el estándar lo hace desde "Shipment Header - Edit" y similares) | Al registrar: "Su licencia no le concede los siguientes permisos en TableData 110 ... Modify" y se deshace todo el registro. No lo detecta la compilación ni la revisión; sale a la primera prueba real (comprobado 18/11/2026) |
| T26 | Integración con texto/XML de un sistema externo (números) | `Evaluate(Decimal, Texto)` y `Format(Decimal/Integer)` sin formato 9 dependen del idioma/región de la sesión (el job queue puede correr con otro usuario); `ConvertStr` de `,`↔`.` "a ojo" solo funciona en un idioma; `Format(10000)` puede dar `10.000`; `Evaluate` sin comprobar deja el valor de la vuelta anterior. Usar `Format(x, 0, 9)` / `Evaluate(x, t, 9)` normalizando el separador | Cantidades x10/x1000 (con región española, `12.5` se lee como 125) o la cantidad de la línea anterior, sin error. Buscar con Grep `Evaluate(` y `Format(` en codeunits de integración antes de probar (comprobado 20/11/2026) |
| T25 | Página API con `part` para líneas (deep insert / `$expand`) | La propiedad de navegación OData es el `EntitySetName` de la `part`, no el nombre del control `part(lines; ...)`. Contrastar documentación, Postman y `.http` con el `EntitySetName` | `$expand=lines` → "Could not find a property named 'lines' on type ..."; el POST con `"lines": [...]` tampoco funciona. Se ve en la primera llamada, antes de entregar el contrato al proveedor (comprobado 19/11/2026) |

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
0a. **Lista previa al registro (regla del usuario: "esto hay que saberlo ANTES de darle a registrar")**: además de las notificaciones, leer y PREDECIR el resultado antes de pulsar Registrar, también en los casos desfavorables:
   - **Cantidades de la línea**: `Cant. a enviar` / `Cant. a recibir` / `Cant. a facturar`. Si son 0, el resultado es "No hay nada que registrar porque el documento no contiene una cantidad ni un importe".
   - **Almacén de la línea**: si exige recepción/envío/picking/ubicación (ficha almacén 5703), BC pone las cantidades a 0 en el pedido y el registro va por el documento de almacén (recepción 5768, envío 7335, picking). Registrar el pedido directamente no es un caso desfavorable útil: su resultado ya se sabe leyendo la línea.
   - Stock disponible en ese almacén y lote, fecha de registro permitida, series y bloqueos.
   - **Antes de reservar**: el campo "Reservar" (Nunca / Opcional / Siempre) de la **ficha del producto** y del **cliente** se copia a la línea al validar el Nº. Con "Nunca" → error "Reserva no debe ser Nunca en Lín. venta: ..." al abrir Reserva. Cambiar la ficha NO corrige líneas ya creadas: hay que cambiar el campo en la línea o volver a introducir el producto. Productos creados con plantilla pueden traer "Nunca".
   - **Antes de ejecutar mensajes de acción** (hojas de planificación/demanda): "Aceptar mensaje acción" marcado en cada línea (en planificación viene desmarcado) y la opción de creación del diálogo (p. ej. "Crear ped. compra") elegida; en blanco no hace nada y no avisa.
   - **Antes de planificar**: tipo de producto Inventario (plantilla "NO INVENTARIADO" lo deja "Fuera de inventario" y no se planifica), "Directiva reaprov." informada y proveedor/sistema de reposición.
   - Escribir el resultado esperado antes de ejecutar; si el real difiere, eso es el hallazgo. Si coincide con lo que ya se sabía leyendo, no hacía falta ejecutar (economía B.1).
0b. **Fail-fast**: si una precondición del caso falla (campo que no se rellena, dato que no existe), PARAR; nunca capturar el error y seguir hasta registrar.
11. **Límite de tiempo por obstáculo (regla del usuario)**: si un paso se resiste (2-3 intentos fallidos), preguntarse si merece la pena para el conocimiento. Si NO, saltar al siguiente apartado o tomar la vía simple (p. ej. crear datos propios en lugar de seguir investigando cuáles existen). Avisar al usuario en una línea.
12. **Crear antes que descubrir** en datos de prueba: datos propios con prefijo reconocible (`QA-...`) son más rápidos y predecibles que buscar cuáles de la demo encajan.

## C. Revisión de incidencias eficiente
1. **Triaje de una sola vez**: texto literal del error, entorno/empresa, usuario, nº de documento, desde cuándo pasa y qué cambió (instalación de extensión, configuración, datos).
2. **Buscar el texto del error en el catálogo (`%USERPROFILE%\bc-catalog\<versión>\errores.tsv`, columna ES) antes de reproducir**: da objeto, línea y la condición `if` que lo dispara en segundos; solo si no está (extensiones, TestField genéricos "X debe tener un valor") buscar en el código (desarrollo + Base App): localiza el objeto y la condición en minutos y dice qué dato o configuración la dispara.
3. **¿Qué cambió?**: versiones en página 2500/2508, registro de cambios, configuración reciente.
4. **Aislar con una variación**: otro usuario (permisos), otro documento/cliente/producto (datos), otra empresa (configuración), sin la extensión (personalización).
5. **Reproducir en sandbox**, nunca en Production.
7. **Errores al leer un fichero (xlsx/zip/xml)**: inspeccionar el fichero real (un .xlsx es un ZIP: listar entradas, leer `workbook.xml`, `_rels`, `sharedStrings`) y crear variantes quitando UNA parte cada vez (hipervínculos, etiqueta de confidencialidad, hojas...). Subir cada variante aísla la causa en 2-3 importaciones sin tocar código.
6. **Solución mínima**: corregir la causa, no el síntoma; proponer además la prueba que evita que vuelva y añadir el patrón aquí si es nuevo.

- **Reserva (kata K3, 19/11/2026)**: antes de reservar leer en la ventana Reservas la fila "Mov. producto": "Cantidad total" menos "Cantidad total reservada" = disponible. Un producto con inventario >0 puede tener todo reservado por otros pedidos ("No hay nada disponible para reservar"): preparar con un ajuste positivo (diario 40, línea Ajuste positivo, nº doc propio) en vez de asumir stock libre; el inventario por API no refleja las reservas.
