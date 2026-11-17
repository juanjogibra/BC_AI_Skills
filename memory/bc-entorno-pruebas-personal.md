---
name: bc-entorno-pruebas-personal
description: Entorno BC personal del usuario para pruebas (sandbox Preproduction) — URL y uso permitido
metadata:
  node_type: memory
  type: reference
  modified: 2026-11-17T13:08:23.248Z
---

Entorno personal de Business Central para pruebas libres: https://businesscentral.dynamics.com/{{BC_TENANT_ID}}/Preproduction
(tenant {{BC_TENANT_ID}}, entorno "Preproduction").
Acceso con la cuenta personal del usuario (ver ficha privada en bc-qa/privado/clientes/personal-preproduction.md), no con la corporativa. Empresa `QA` (copia de CRONUS ES) para el juego de datos de pruebas.

**Why:** el usuario lo ofreció (17/11/2026) para hacer pruebas cuando haga falta, p. ej. validar técnicas de la skill bc-ui-testing o de la futura skill bc-qa.
**How to apply:** usarlo para comprobar comportamientos/páginas de BC antes de documentarlos o cuando no haya entorno de cliente. Aun así, confirmar antes de registrar/eliminar documentos salvo petición explícita. Relacionado: [[bc-qa-skill]].
