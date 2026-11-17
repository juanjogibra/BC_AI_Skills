# Diseño de casos de prueba

## Formato de la matriz

| ID | Proceso | Tipo | Precondiciones / datos | Pasos (resumen) | Resultado esperado (pantalla + movimientos) | Prioridad |
|---|---|---|---|---|---|---|
| C01 | Factura venta | Positivo | Cliente 10000, producto 1000 sin lote, almacén sin requerimientos | Crear, 1 línea x2 uds, registrar | Factura registrada con campo X = Y; mov. cliente importe IVA incl.; G/L cuadra; mov. producto -2 | Alta |

El resultado esperado debe ser **comprobable y concreto** (valores, no "funciona bien").

## Tipos de caso a cubrir
- **Positivo**: el camino principal del requisito.
- **Negativo**: lo que debe impedirse (error esperado con su texto). Comprobar que no queda nada a medias registrado.
- **Límite**: 0, negativos, máximos, decimales y redondeo, campo vacío, fechas límite (cierre de periodo, fecha de registro permitida).
- **Alternativo**: otra vía al mismo resultado (pedido vs factura directa, copiar documento, desde oferta, registro en lote, cola de proyectos, API).
- **Regresión**: procesos indirectos del análisis de impacto que deben seguir igual que antes.

## Variables que multiplican casos (elegir con criterio, no combinar todo)
Tipo de documento (oferta/pedido/factura/abono/devolución) · tipo de línea (producto/cuenta/recurso/cargo) · divisa · IVA incluido · seguimiento lote/serie · almacén con o sin requerimientos · dimensiones · registro parcial · usuario sin SUPER.
Técnica: una variable de riesgo por caso sobre una base que ya pasa (no cambiar tres cosas a la vez: si falla, no se sabe por qué).

## Datos de prueba
- Reutilizar los de la ficha del cliente. Preferir datos "limpios" (cliente sin bloqueos, sin descuentos raros) salvo que el caso los necesite.
- Anotar en la ficha del cliente los datos nuevos que valga la pena reutilizar (p. ej. "producto con lote y stock en almacén X").
