# Top 20 circuitos de prueba (estado y hallazgos)

Catálogo de circuitos estándar con su verificación esperada y casos desfavorables. Estado de la práctica en entorno de pruebas (CRONUS ES copiado, BC 29). Reutilizar como base de la matriz de casos.

| # | Circuito | Caso desfavorable | Estado | Verificación clave / hallazgo |
|---|---|---|---|---|
| 1 | Venta pedido divisa + lote | — | ✅ | Cliente: importe divisa + DL; G/L cuadra por asiento (venta y coste en asientos distintos); producto con nº **albarán** |
| 2 | Compra pedido divisa | Nº factura proveedor duplicado | ✅ ✅ | Bloquea: "Ya existe la compra Factura X para este proveedor" (página 700); la factura queda sin registrar |
| 3 | Venta parcial (enviar / facturar) | Vender más lote del disponible | ✅ ✅ | Al rellenar solo avisa (notificación + "¿Desea continuar?"); al registrar bloquea: "Nº lote X ... no puede ser liq. totalm." |
| 4 | Abono venta (Corregir factura) | — | ✅ | "Corregir" en factura registrada cancela directamente (pregunta si venía de pedido); abono **correctivo** auto-liquidado con la factura; lote vuelve (+) con tipo "Venta" y doc "Abono venta" |
| 5 | Devolución / abono compra parcial | Corregir factura ya consumida | ✅ ✅ | No deja corregir si la mercancía recibida ya se vendió (FIFO). **Mensaje engañoso** ("se ha devuelto total o parcialmente"): la causa real es `Cantidad pendiente` < cantidad. Abono compra NO se liquida solo con la factura. ES: pide "N.º factura corregida" (SII) |
| 6 | Envío directo | — | ⏸ pendiente | Producto con "Cód. compra" = ENVIO DIR. hereda el envío directo en la línea (columna oculta). La acción "Obtener pedido de venta" del pedido de compra está en menú secundario no accesible por script → probar vía Hoja de demanda o personalizar |
| 7 | Almacén avanzado: recepción (AMARILLO) | Usuario no empleado de almacén | ✅ ✅ | "Crear recepción en almacén" crea la recepción, pero sin **empleado de almacén** (pág. 7348) para el usuario/almacén no se puede abrir ni listar (pregunta "¿Desea hacerlo ahora?"). Configuración imprescindible. Tras darlo de alta (pág. 7328): "Registrar recep." → mov. producto +5 con nº albarán compra y "1 actividad de almacenamiento creada" (put-away). Sin ubicaciones no hay movs. de almacén (7318) |
| 8 | Almacén avanzado: envío + picking | Registrar sin manipular | pendiente | |
| 9 | Transferencia entre almacenes | Sin stock en origen | ✅ ✅ | Envío: origen −, tránsito +; recepción: tránsito −, destino +; mismo coste; pedido se borra al completarse. Sin stock en la ubicación: notificación previa + error "El producto X no está en inventario" (el stock sin almacén no cuenta) |
| 10 | Fabricación (OP lanzada → consumo/salida) | — | ⛔ sin datos | CRONUS ES (evaluación) no trae L.M. de producción ni OP: requiere montar producto + L.M. + ruta antes |
| 11 | Ensamblado (L.M. ensamblado) | — | ⛔ sin datos | Sin pedidos de ensamblado en la demo: crear L.M. de ensamblado en un producto |
| 12 | Activos fijos (alta + amortización) | — | pendiente | Hay 9 A/F demo (FA000010...) → viable con diario general A/F + informe Calcular amortización |
| 13 | Servicio (pedido de servicio) | — | ⛔ sin datos | Sin pedidos de servicio en la demo |
| 14 | Cobro y liquidación | — | ✅ | Diario de cobros (255): Tipo mov.=Cliente (select), Nº cuenta, Importe haber, "Liq. por tipo documento"=Factura (select), "Liq. por nº documento" → factura queda sin pendiente |
| 15 | Cartera (efectos) | — | ✅ | Factura con forma pago que crea efectos → **3 movs. cliente**: Factura (+), "Convertir factura en efectos" (−), **Efecto nº 1** (+, Situación=Cartera, Abierto). La factura queda cerrada |
| 16 | Descuentos línea | — | ✅ | 2 × 1.005,80 − 10 % = 1.810,44 en importe línea |
| 17 | Cliente bloqueado | Crear documento con cliente bloqueado | ✅ | Error de validación de campo (no diálogo): "No puede crear este tipo de documento cuando el cliente X está bloqueado por el tipo Todo". Opciones de Bloqueado: " "/Envío/Factura/Todo |
| 18 | Límite de crédito | Superar límite | ⚠️ parcial | Aviso solo como notificación al introducir la línea (no bloquea); al reabrir el documento no se muestra |
| 19 | Revertir asiento | — | ⏸ pendiente | Registro C/G (116) tiene acción "Revertir" pero no reaccionó sobre un cobro liquidado; hipótesis sin confirmar: desliquidar antes o es grupo de menú |
| 20 | Valoración existencias (informe 795) | — | pendiente | |

## Reglas aprendidas para circuitos
- **Verificar siempre en datos, no en pantalla**: tras registrar, la ficha puede mostrar valores antiguos (p. ej. "Cant. a facturar" sin actualizar). Leer movimientos/registrados con filtro.
- Localización ES añade pasos: factura corregida en abonos (SII), Cartera en clientes/proveedores con forma de pago que crea efectos.
- Configuración que bloquea circuitos enteros y se olvida: empleados de almacén, códigos de compra, series, fecha de registro permitida.
