# Verificación en movimientos

Regla: tras registrar, comprobar **cada** tabla de movimientos que el proceso debería generar, y que no haya ninguna inesperada.

## Punto de partida: "Find entries" (antes "Navigate", página 344)
- Desde el documento registrado: acción `&Navigate` con caption "Find entries..." (en español, pendiente de comprobar el texto exacto en la interfaz). Muestra, por tabla, cuántos movimientos hay con ese nº de documento y fecha; desde cada fila se abre la tabla filtrada.
- En la página 344 directamente: campos `DocNoFilter` (Nº documento) y `PostingDateFilter` (Fecha registro) + acción "Find". En ES incluye también filtro de documentos de Cartera.
- Alternativa por URL: abrir cada página de movimientos con `filter='Document No.' IS '<nº>'`.

## Páginas de verificación
IDs comprobados en el código de la Base App 29.1 (17/11/2026). Columna "Interfaz": si el filtro por URL se ha comprobado en uso real.

| Qué | Página | Filtro URL útil | Interfaz |
|---|---|---|---|
| Find entries (Navigate) | 344 | (rellenar Nº documento y fecha) | pendiente |
| Movs. contabilidad | 20 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. clientes | 25 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. detallados clientes | 573 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. proveedores | 29 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. IVA | 315 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. productos | 38 | `'Document No.' IS '<nº>'` / `'Item No.' IS 'X' AND 'Open' IS '1'` | comprobado (filtro por producto) |
| Movs. valor | 5802 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. almacén (warehouse) | 7318 | `'Source No.' IS '<nº>'` | pendiente |
| Seguimiento de producto | 6520 | (por lote/serie) | pendiente |
| Albaranes venta registrados | 142 | `'No.' IS '<nº>'` | pendiente |
| Facturas venta registradas | 143 | `'No.' IS '<nº>'` | pendiente |
| Abonos venta registrados | 144 | | pendiente |
| Albaranes compra registrados | 145 | | pendiente |
| Facturas compra registradas | 146 | | pendiente |
| Abonos compra registrados | 147 | | pendiente |

Al usar una página en real, marcar "comprobado" (o corregir el filtro). Si una versión futura cambia un ID, comprobarlo en el código de la Base App de esa versión (`scripts/Expand-ALSource.ps1`).

## Comprobaciones por tipo de movimiento
- **Contabilidad**: la transacción cuadra (suma 0); cuentas según grupos contables (cliente/proveedor, producto, general); IVA a la cuenta correcta; dimensiones.
- **Cliente/proveedor**: importe = total IVA incluido del documento; signo (factura +/abono − en clientes); vencimiento y forma de pago; queda abierto (o cerrado si se liquidó).
- **IVA**: base e importe por grupo de IVA; tipo (venta/compra); en ES, coherencia con SII si aplica.
- **Producto**: cantidad y signo (venta −, compra +); almacén; lote/serie; `Cantidad pendiente`; tipo de movimiento.
- **Valor**: coste esperado vs real; tras "Valorar existencias - movs. producto" (informe 795) el coste se ajusta.
- **Campos del desarrollo**: el campo nuevo aparece en el documento registrado y, si procede, en los movimientos.
- **Efectos laterales**: estado del documento origen (pedido: cantidades enviadas/facturadas, si se elimina al completarse), stock disponible, otros documentos relacionados.
