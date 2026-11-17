# BC AI Skills

Skills y configuración de Claude Code para trabajar en **Microsoft Dynamics 365 Business Central** con criterio de **consultor QA funcional**: análisis de impacto, diseño de pruebas, ejecución en el cliente web, verificación en movimientos, análisis de incidencias y aprendizaje continuo.

> Repositorio público y **anonimizado**: las rutas de usuario y los IDs de tenant se guardan como marcadores (`{{USERPROFILE}}`, `{{BC_TENANT_ID}}`…). Los datos reales de clientes (`skills/*/privado/`) **no se suben nunca**.

## Contenido

| Carpeta | Qué es |
|---|---|
| `skills/bc-qa` | Rol de consultor QA funcional de BC: impacto, matriz de casos, verificación en movimientos, defectos, informes y catálogo de patrones de problemas transversales |
| `skills/bc-ui-testing` | Mecánica para manejar el cliente web de BC con el MCP de Playwright (URLs, controles, diálogos, registro, PTE) |
| `claude/CLAUDE.md` | Instrucciones globales (idioma, BCQuality, convenciones AL con prefijo `ABP` y traducciones `ESP=`, rol QA, autoaprendizaje) |
| `memory/` | Memoria persistente de Claude Code |
| `bc-browser/start-bc-browser.ps1` | Arranca Edge con depuración remota (puerto 9222) para que Claude lo controle y se vea en VS Code |
| `config/playwright-mcp.json` | Configuración del servidor MCP de Playwright |
| `scripts/` | Exportar desde el PC al repositorio y restaurar en un PC nuevo |

## Qué NO incluye
- `skills/bc-qa/privado/`: fichas de clientes y diario de casos reales. Guárdalo aparte (p. ej. en OneDrive de empresa) si quieres conservarlo.
- Skills de Anthropic (`~/.claude/skills/synced`): se sincronizan solas con la cuenta.
- El plugin BCQuality: se instala desde su origen (ver abajo).

## Hacer backup (en el PC habitual)
```powershell
cd $env:USERPROFILE\BC_AI_Skills
powershell -ExecutionPolicy Bypass -File scripts\Export-ToRepo.ps1
git add -A
git commit -m "Backup skills"
git push
```
El script falla si detecta restos sensibles (nombre de usuario o GUIDs) en lo exportado.

## Restaurar en un PC nuevo / pasarlo a otra persona
1. Instalar Claude Code, VS Code, Node.js (para `npx`), Git y Microsoft Edge.
2. Clonar: `git clone https://github.com/juanjogibra/BC_AI_Skills.git $env:USERPROFILE\BC_AI_Skills`
3. Restaurar:
   ```powershell
   cd $env:USERPROFILE\BC_AI_Skills
   powershell -ExecutionPolicy Bypass -File scripts\Restore-FromRepo.ps1 -TenantId <guid-del-tenant-de-BC>
   ```
   (Si ya hay un `CLAUDE.md`, se guarda una copia `.bak-<fecha>`. La memoria existente no se sobrescribe salvo `-Force`.)
4. Plugin BCQuality (en Claude Code):
   ```
   /plugin marketplace add microsoft/BCQuality
   /plugin install bcquality@bcquality
   ```
5. MCP de Playwright: añadir el bloque de `config/playwright-mcp.json` a `mcpServers` de `~/.claude.json`, sustituyendo `{{USERPROFILE_FWD}}` por la ruta del usuario con `/` (p. ej. `C:/Users/nombre`).
6. VS Code: extensión **Microsoft Edge Tools for VS Code** para ver el navegador de pruebas (Targets → Toggle browser).
7. Revisar en `claude/CLAUDE.md` y en las skills que no queden marcadores `{{...}}` sin sustituir (p. ej. la URL del entorno de pruebas).
8. Si es otra persona: adaptar en `CLAUDE.md` lo que sea personal (entorno de pruebas, convenciones de la empresa).
