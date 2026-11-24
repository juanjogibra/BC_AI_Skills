# Análisis de defectos

## Procedimiento
1. **Reproducir** con los mínimos datos. Anotar texto literal del error, página, acción, documento.
2. **Detalle técnico**: en el diálogo de error, "Compartir detalles" → "Copiar detalles del error" incluye la pila de llamadas AL con objeto, línea y extensión (comprobado 20/11/2026 en la interfaz en español). Si el registro falla, la página 700 "Mensajes de error" muestra la descripción y el contexto.
   - **"Error de licencia" no siempre es la licencia de BC**: muchos ISV (p. ej. productos con su propio gestor de licencias) cierran páginas estándar desde un `pageextension` `OnOpenPage` cuando el usuario no tiene licencia de su producto ("Page Clientes has to close"). Si falla en un entorno y no en otro del mismo tenant, comparar extensiones instaladas (page 2500, filtro por editor): las licencias de BC son por tenant, no por entorno. Los usuarios técnicos/delegados suelen no tener licencia de ese ISV.
3. **Buscar el texto del error** en el código:
   - Repositorio de la extensión (Grep del texto del Label en inglés o del texto traducido en `.xlf`).
   - Código estándar (`MSDyn365BC.Code.History` o fuentes en `.alpackages`).
   El objeto que lanza el error indica el origen.
4. **Clasificar**:

| Clase | Indicios | Acción |
|---|---|---|
| Configuración | Falta grupo contable, serie numérica, configuración IVA, almacén, código de seguimiento | Indicar qué configurar; no es defecto del desarrollo |
| Datos | Ficha incompleta o bloqueada, stock insuficiente, lote inexistente | Corregir datos de prueba y repetir |
| Estándar | El error viene de la Base App y se reproduce sin el desarrollo (o en otra empresa sin él) | Comportamiento estándar: documentar; si es bug, referenciarlo |
| Personalización | Pila de llamadas pasa por objetos de la extensión (prefijo ABP u otro de terceros) | Defecto: objeto, línea y causa probable |
| Entorno/permisos | Error de permisos, versión, licencia, extensión no instalada | Indicar requisito |

5. Para un defecto de personalización: indicar objeto y procedimiento, causa probable y propuesta de corrección (si se va a corregir código AL, aplicar las skills BCQuality).

## Avisos que parecen errores
- "Sales Invoice/Order %1 already exists for this customer." (tabla Sales Header, `SalesAlreadyExistsTxt`) es una **notificación**, no un error: no detiene el proceso. Sale al validar Nº documento externo cuando ya hay otro documento del cliente con ese mismo número. En un proceso por lotes que crea facturas (p. ej. Combine Shipments con personalización), indica que se ha creado **otra** factura con el mismo Nº documento externo; no es la causa de que falten documentos.
- Un proceso por lotes estándar que "se salta" documentos sin dar error: revisar PRIMERO los `where(... const ...)` del DataItemTableView del informe (p. ej. Combine Shipments exige "Combine Shipments" = Sí en el pedido, que se hereda del cliente de facturación cuando se crea el pedido). Comparar ese campo filtrando la lista por URL entre los documentos procesados y los no procesados.
