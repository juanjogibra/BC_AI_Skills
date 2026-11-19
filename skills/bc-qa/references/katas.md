# Banco de pruebas (katas) de bc-tester

Objetivo: medir si el subagente mejora tras cada cambio de `bc-tester.md` o de las skills. Mismo encargo, misma empresa de pruebas, resultado predecible. Se lanza tras cambios relevantes y se anota la fila de métricas. Empresa: la de pruebas (QA) del sandbox personal; nunca Production.

## Katas
| K | Qué ejercita | Caso | Resultado correcto |
|---|---|---|---|
| K1 | Flujo feliz + verificación por API | Pedido de venta, cliente 10000, producto 1960-S × 2, en un almacén SIN exigencias de almacén (el tester lo elige con el preflight). Registrar "Enviar y facturar". | 1 factura registrada; movs. por API desde la base: producto −2, cliente +importe con IVA, contabilidad cuadrada (suma 0), valor con coste |
| K2 | Anticipación sin registrar | Mismo pedido en un almacén con Envío requerido. Predecir el resultado de registrar leyendo la línea. | Predice "nada que registrar" (Cant. a enviar = 0) sin registrar; indica que hace falta envío de almacén |
| K3 | Precondiciones de reserva | Pedido de venta 10000 con producto 1001 × 1, reservar desde inventario. | Comprueba ANTES la disponibilidad real (Total/Reservado/Disponible en la ventana Reservas: el inventario por API no descuenta reservas de otros documentos; el 19/11/2026 1001 estaba 100 % reservado) y prepara stock si hace falta; detecta en el preflight la Reserva del producto/cliente; si es Nunca la cambia a Opcional ANTES de crear la línea (si no, la línea la copia); reserva 1 ud; la ventana Reservas muestra el mov. de producto como origen |
| K4 | Catálogo de errores | Factura de compra proveedor 10000, 1 línea, SIN Nº factura proveedor. Predecir el error desde `errores.tsv` y comprobarlo registrando. | Error predicho = error real (Nº factura proveedor debe tener un valor); no se crea nada; la factura queda abierta |

Casos desfavorables extra que el tester debería añadir por sí mismo (puntúan proactividad): p. ej. K1 con cantidad mayor que el stock disponible (solo predecir), K3 reservar más de lo disponible ("No hay nada disponible para reservar").

## Métricas por ejecución
| Fecha | Versión agente | Tiempo total | Intentos fallidos | Acierto predicciones | Casos añadidos por iniciativa | Idas y vueltas con el principal | Notas |
|---|---|---|---|---|---|---|---|
| 19/11/2026 | v2 (protocolo + plantilla) | 27 min | 12 (clics esperando "stable" con Chrome tapado) | 5/6 (K3: stock reservado por otros) | 2 | 0 | Resultado K1-K4 OK. ~12 min perdidos en clics: corregido con L.clk (click → force → dispatchEvent) y flags de Chrome contra el ahorro en ventanas tapadas |
| 19/11/2026 | v2 + L.clk (1ª corrección) | 35-40 min (K2-K4) | ~10 | — | 0 | 0 | No cumple: causa raíz = ventana oculta (visibilityState hidden); L.clk daba falso éxito con force; expandLines/answer/menu con fallos. Corregido con L.ensureVisible y librería revisada |
| 19/11/2026 | v3 (ensureVisible + librería revisada) | ~19 min (K2-K4 + limpieza) | 4 min con ventana tapada; 0 clics lentos con ventana visible | 3/3 | 0 | 0 | CUMPLE: todo con funciones de la librería, todos los clics vía "click". Pendiente: ventana tapada estando maximizada (ensureVisible no la destapa → flags de Chrome al reiniciar). Corregidos después: answer con diálogos apilados, menu por title, menuPath |
