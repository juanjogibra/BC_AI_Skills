# Verificación en movimientos

Regla: tras registrar, comprobar **cada** tabla de movimientos que el proceso debería generar, y que no haya ninguna inesperada.

## Punto de partida: "Buscar movs..." (Find entries / Navigate, página 344)
- Desde el documento registrado: menuitem **"Buscar movs..."** (comprobado 17/11/2026) → página "Buscar movs." con una fila por tabla y su número de movimientos (p. ej. factura venta: Mov. contabilidad 6, Mov. IVA 1, Mov. cliente 2, Movs. clientes detallados 4, Movimiento valor 1). Leerla con `browser_evaluate` (última `[role=grid]`).
- **Ojo**: en una venta enviada desde pedido, los **movs. de producto llevan el nº del albarán**, no el de la factura; filtrar movs. producto por nº de factura da 0 (la factura solo aparece en movs. valor). Para producto filtrar por `'Item No.' IS 'X' AND 'Lot No.' IS 'L'` (comprobado en ciclo completo pedido→envío+factura).
- **Divisa**: en movs. cliente comprobar `Importe` (divisa) y `Importe (DL)`; en contabilidad, `Importe divisa origen` vs importes DL; la transacción de venta y la de coste llevan **nº de asiento distinto** (cuadrar cada una por separado).
- Patrón de verificación eficiente: un solo `run_code` que lee 25 / 20 / 38 / 5802 con cabeceras (`bc-ui-testing/references/snippets.md`) y comparar con la tabla de esperados del caso.
- En la página 344 directamente: campos `DocNoFilter` (Nº documento) y `PostingDateFilter` (Fecha registro) + acción "Find". En ES incluye también filtro de documentos de Cartera.
- Alternativa por URL: abrir cada página de movimientos con `filter='Document No.' IS '<nº>'`.

## Páginas de verificación
IDs comprobados en el código de la Base App 29.1 (17/11/2026). Columna "Interfaz": filtro por URL comprobado en uso real (BC lo reescribe como `'Tabla'.'Campo'`).

| Qué | Página | Filtro URL útil | Interfaz |
|---|---|---|---|
| Buscar movs. (Navigate) | 344 | (desde el documento: "Buscar movs...") | comprobado |
| Movs. contabilidad | 20 | `'Document No.' IS '<nº>'` | comprobado |
| Movs. clientes | 25 | `'Document No.' IS '<nº>'` | comprobado |
| Movs. detallados clientes | 573 | `'Document No.' IS '<nº>'` | comprobado |
| Movs. proveedores | 29 | `'Document No.' IS '<nº>'` | pendiente |
| Movs. IVA | 315 | `'Document No.' IS '<nº>'` | comprobado |
| Movs. productos | 38 | `'Document No.' IS '<nº>'` / `'Item No.' IS 'X' AND 'Open' IS '1'` | comprobado (filtro por producto) |
| Movs. valor | 5802 | `'Document No.' IS '<nº>'` | comprobado |
| Movs. almacén (warehouse) | 7318 | `'Source No.' IS '<nº>'` | comprobado |
| Seguimiento de producto | 6520 | (por lote/serie) | pendiente |
| Albaranes venta registrados | 142 | `'No.' IS '<nº>'` | pendiente |
| Facturas venta registradas | 143 (lista) / 132 (ficha) | `'No.' IS '<nº>'` en 132 | comprobado |
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
