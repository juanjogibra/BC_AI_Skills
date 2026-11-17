---
name: backup-skills-github
description: "Backup de skills/CLAUDE.md/memoria en el repo público de GitHub del usuario, anonimizado y sin datos de clientes"
metadata:
  node_type: memory
  type: project
  modified: 2026-11-17T12:47:59.645Z
---

Repo de backup: https://github.com/juanjogibra/BC_AI_Skills (PÚBLICO), clon local en `%USERPROFILE%\BC_AI_Skills`. Creado el 17/11/2026. Se actualiza con `scripts/Export-ToRepo.ps1` (copia desde ~/.claude anonimizando rutas y GUIDs de tenant, excluyendo `privado/` y `synced/`) y se restaura con `scripts/Restore-FromRepo.ps1 -TenantId <guid>`.

**Why:** el usuario quiere poder reinstalar Claude, cambiar de PC o pasar el conocimiento a otra persona. Eligió repo público anonimizado y pidió expresamente que los datos reales de clientes vayan en ficheros aparte que NO se suban.
**How to apply:** datos de clientes solo en `skills/bc-qa/privado/` (excluido por el script y por .gitignore). Antes de cada push revisar que el export no avisa de restos sensibles. Commits con el email noreply de GitHub, no el corporativo. El backup NO es automático (decisión del usuario, 17/11/2026): solo cuando aprenda algo crucial para las pruebas se lo aviso de forma destacada (📌 Aprendizaje crucial) y propongo subirlo; sin su visto bueno no se sube nada. Relacionado: [[bc-rol-consultor-qa]].
