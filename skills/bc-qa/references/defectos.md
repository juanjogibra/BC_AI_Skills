# Análisis de defectos

## Procedimiento
1. **Reproducir** con los mínimos datos. Anotar texto literal del error, página, acción, documento.
2. **Detalle técnico**: en el diálogo de error, "Copiar detalles" incluye la pila de llamadas AL (si el usuario tiene permisos). *(pendiente de comprobar en la interfaz en español)*. Si el registro falla, la página 700 "Mensajes de error" muestra la descripción y el contexto.
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
