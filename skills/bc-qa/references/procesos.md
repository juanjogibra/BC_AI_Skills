# Procesos estándar: qué generan y qué comprobar

Resumen operativo. Para detalle funcional, consultar Microsoft Learn con el MCP.

## Ventas
| Paso | Documento resultante | Movimientos esperados |
|---|---|---|
| Oferta → Pedido | Pedido (oferta se elimina o archiva según configuración) | Ninguno |
| Pedido: Enviar | Albarán venta registrado | Producto (−, Venta), Valor (coste esperado si está activo "Registrar coste esperado") , Almacén si hay ubicaciones |
| Pedido: Facturar / Factura directa | Factura venta registrada | Contabilidad (clientes, ventas, IVA; coste de ventas/existencias si registro automático de coste), Cliente, IVA, Valor (real); Producto si no se envió antes |
| Abono / Devolución | Abono registrado (+ recepción de devolución) | Igual con signo contrario; producto (+) si devuelve mercancía |
| Deshacer envío | Línea de corrección en el albarán | Producto (+) que compensa |
Puntos delicados: envío/factura parciales, "Obtener líneas de albarán", precios IVA incluido, divisa, descuento factura, crédito máximo, cliente bloqueado.

## Compras
Simétrico a ventas: Recibir → albarán de compra (Producto +), Facturar → factura de compra (Contabilidad: proveedores, compras/existencias, IVA soportado; Proveedor; IVA; Valor). En compras el **Nº factura proveedor** es obligatorio y no se puede repetir para el mismo proveedor.
Puntos delicados: cargos de producto (asignación a recepciones), coste directo vs coste unitario, prepagos, IVA no deducible.

## Inventario
- Diario de productos: ajuste positivo/negativo → Producto y Valor; contabilidad si registro automático de coste.
- Transferencias: envío (Producto − en origen, + en tránsito) y recepción (− tránsito, + destino).
- Valoración: "Valorar existencias - movs. producto" (informe 795) ajusta costes; "Registrar coste inventario en contabilidad" si no es automático.
- Seguimiento: lote/serie obligatorio según código de seguimiento; caducidad si el código lo exige.

## Almacén (warehouse)
Según la ficha del almacén: "Recepción requerida", "Envío requerido", "Ubicación obligatoria", "Ubicación y picking dirigidos".
- Con envío requerido no se puede enviar desde el pedido: Envío de almacén → (Picking) → Registrar envío.
- Comprobar movs. de almacén (ubicación, cantidad) además de movs. de producto.

## Contabilidad
- Diario general: el documento debe cuadrar por nº documento; fecha dentro del rango permitido (Configuración de usuario / Configuración contabilidad).
- Revertir transacción: genera movimientos opuestos y marca el original como revertido.
- Periodo cerrado o fecha no permitida → error esperado (caso negativo útil).
