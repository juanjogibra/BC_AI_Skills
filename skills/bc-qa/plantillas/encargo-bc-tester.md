# Encargo para bc-tester (plantilla)

Rellenar entero antes de delegar. Lo que no se sepa, decirlo ("buscar un producto con stock en X") en lugar de omitirlo: el subagente solo sabe lo que pone aquí.

## Objetivo
<qué se prueba y por qué: desarrollo, incidencia o circuito estándar; criterio de aceptación en una frase>

## Entorno
- URL base: `https://businesscentral.dynamics.com/<tenant>/<entorno>?company=<empresa>` (nunca Production)
- Empresa (id para API): <guid>
- Fecha de trabajo: <dd/mm/aaaa>
- Sesión comprobada por el agente principal: sí/no

## Datos
- Producto / cliente / proveedor / almacén: <códigos> (o cómo crearlos: prefijo `QA-`)
- Preflight: `L.preflight({item:'…', customer:'…', vendor:'…', location:'…'})` — solo las fichas que use el circuito
- Preparación permitida: <p. ej. ajuste positivo de stock, cambiar Reserva a Opcional>

## Casos
| Nº | Caso | Pasos clave | Predicción (documento, movimientos, error esperado) | ¿Registra? |
|---|---|---|---|---|
| 1 | | | | sí/no |

Casos desfavorables baratos: el tester añade los evidentes que no registran.

## Verificación
- Tablas por API y filtro: <p. ej. `generalLedgerEntries`, `itemLedgerEntries`, `microsoft/analytics/v1.0 itemValueEntries`> con `entryNumber gt <base>`
- Lo que solo se ve en pantalla: <página, campo>

## Límites
- Tiempo máximo: <p. ej. 20 min>; máx. 3 intentos por obstáculo
- No hacer: <p. ej. no registrar facturas, no tocar configuración general>

## Pistas del catálogo
<acciones con nombre ES exacto, pestaña o grupo de menú, y errores esperados sacados de `acciones.tsv` / `errores.tsv`>
