# Análisis de impacto de un cambio AL

Leer el diff y, para cada objeto tocado, preguntarse qué procesos pasan por él.

## Señales en el código → qué probar

| En el código | Impacto a considerar |
|---|---|
| Suscriptor a eventos de `Sales-Post` (cod. 80), `Purch.-Post` (90), `Gen. Jnl.-Post Line` (12), `Item Jnl.-Post Line` (22), `Whse.` | Todo registro que pase por ese codeunit: pedido, factura, abono, devolución, envío/recepción parcial, registro en lote y **en segundo plano (cola de proyectos)** |
| Campo nuevo en `Sales Header`/`Sales Line` (o compra) | Propagación a registrados (`Sales Invoice Header`, `Sales Shipment Header`, `Sales Cr.Memo Header`...): requiere el **mismo ID de campo** en las tableextension para `TransferFields`. Probar también Copiar documento, Archivar, Oferta→Pedido, Pedido abierto→Pedido, Abono correctivo |
| Campo nuevo en Cliente/Proveedor/Producto | Se hereda al documento al validar el cliente/producto? Plantillas de cliente/producto, cambio de cliente en un documento con líneas |
| `OnValidate` / `OnBeforeValidate` de campos estándar | Orden de validación en la página, importación por API/config. packages, cambio posterior del campo, valores en blanco |
| `OnInsert` / `OnModify` / `OnDelete` (triggers o suscriptores) | Creación desde otras vías: copiar, plantillas, API, cola de proyectos; borrado de documentos con líneas; **renombrar** |
| Páginas/pageextension | Campo visible y editable donde toca, solo lectura en registrados, ToolTip, en ambas vistas (lista/ficha), personalizaciones de perfil |
| Informes / layouts | Documento sin el dato, varias páginas, divisa, idioma del cliente, impresión desde registrado y desde lista |
| Cálculos de importes/precios/descuentos | Redondeos, IVA incluido/excluido, divisa extranjera, cantidades decimales, precio 0, descuento 100 % |
| Upgrade/Install codeunit | Datos existentes antes del cambio (registros antiguos con el campo nuevo vacío) |
| Permisos (permissionset) | Usuario sin SUPER: ¿puede ejecutar el proceso? Tablas nuevas incluidas en el permissionset |
| Job queue / procesos en segundo plano | Sin interfaz: `Confirm`/`Message`/`Page.RunModal` fallan o se ignoran |
| Integraciones (SII, Document Capture, conectores, API) | Efecto en el envío/recepción externa y en los estados de esos módulos |

## Procesos indirectos que se olvidan a menudo
- Abonos y devoluciones (signo contrario), **deshacer envío/recepción**, revertir transacción.
- Registro parcial (enviar parte, facturar parte) y varios envíos facturados juntos (Obtener líneas de albarán).
- Divisa extranjera y "Precios IVA incluido".
- Producto con seguimiento (lote/serie) y almacén con requerimientos (envío/recepción/picking/ubicaciones).
- Registro en lote y registro en segundo plano.
- Datos ya existentes antes de instalar la versión nueva.

## Riesgo
- **Alto**: toca registro, importes, IVA, stock o contabilidad; o datos que no se pueden corregir sin abono/ajuste.
- **Medio**: cambia comportamiento de documentos sin registro o validaciones de entrada.
- **Bajo**: visual (captions, visibilidad), informes informativos.
