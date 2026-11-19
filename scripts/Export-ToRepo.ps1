<#
.SYNOPSIS
  Copia las skills propias, CLAUDE.md global, la memoria y el script del navegador desde este PC al repositorio,
  ANONIMIZANDO (rutas de usuario y GUIDs de tenant) y EXCLUYENDO datos de clientes.
.DESCRIPTION
  - Skills: todas las carpetas de ~/.claude/skills excepto 'synced' (skills de Anthropic, se sincronizan solas).
  - Nunca exporta carpetas 'privado' (datos reales de clientes).
  - Al final busca restos sensibles (nombre de usuario, GUIDs) y falla si encuentra alguno.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\Export-ToRepo.ps1
  git add -A; git commit -m "Backup <fecha>"; git push
#>
param(
    [string]$ClaudeDir = (Join-Path $env:USERPROFILE '.claude'),
    [string]$BrowserDir = (Join-Path $env:USERPROFILE 'bc-browser')
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$userHome = $env:USERPROFILE
$homeFwd = $userHome -replace '\\', '/'
$memSlug = $userHome -replace '[:\\/]', '-'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$guid = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
$binaryExt = '.png', '.jpg', '.jpeg', '.gif', '.zip', '.app', '.pdf', '.ico'

function Convert-Anon([string]$t) {
    # Metadatos de sesion de Claude Code (no sirven en otro PC)
    $t = [regex]::Replace($t, '(?m)^\s*originSessionId:.*\r?\n', '')
    $t = [regex]::Replace($t, [regex]::Escape($userHome), '{{USERPROFILE}}', 'IgnoreCase')
    $t = [regex]::Replace($t, [regex]::Escape($homeFwd), '{{USERPROFILE_FWD}}', 'IgnoreCase')
    $t = [regex]::Replace($t, [regex]::Escape($memSlug), '{{MEMORY_SLUG}}', 'IgnoreCase')
    $t = [regex]::Replace($t, $guid, '{{BC_TENANT_ID}}')
    return $t
}

function Export-File([string]$src, [string]$dst) {
    New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
    if ($binaryExt -contains [IO.Path]::GetExtension($src).ToLower()) { Copy-Item $src $dst -Force; return }
    $t = [IO.File]::ReadAllText($src)
    [IO.File]::WriteAllText($dst, (Convert-Anon $t), $utf8)
}

# Limpiar destino para reflejar borrados
foreach ($d in 'skills', 'claude', 'memory', 'bc-browser') {
    $p = Join-Path $repo $d
    if (Test-Path $p) { Remove-Item $p -Recurse -Force }
}

# 1. Skills propias
$skillsDir = Join-Path $ClaudeDir 'skills'
Get-ChildItem $skillsDir -Directory | Where-Object { $_.Name -ne 'synced' } | ForEach-Object {
    $skill = $_
    Get-ChildItem $skill.FullName -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($skill.FullName.Length + 1)
        if ($rel -match '(^|\\)privado(\\|$)') { return }
        Export-File $_.FullName (Join-Path $repo "skills\$($skill.Name)\$rel")
    }
}

# 2. CLAUDE.md global
$claudeMd = Join-Path $ClaudeDir 'CLAUDE.md'
if (Test-Path $claudeMd) { Export-File $claudeMd (Join-Path $repo 'claude\CLAUDE.md') }

# 3. Memoria
$memDir = Join-Path $ClaudeDir "projects\$memSlug\memory"
if (Test-Path $memDir) {
    Get-ChildItem $memDir -File -Filter *.md | ForEach-Object { Export-File $_.FullName (Join-Path $repo "memory\$($_.Name)") }
}

# 4. Script del navegador de pruebas (sin perfil ni salidas)
$browserScript = Join-Path $BrowserDir 'start-bc-browser.ps1'
if (Test-Path $browserScript) { Export-File $browserScript (Join-Path $repo 'bc-browser\start-bc-browser.ps1') }
# Lanzador del MCP bc-en-vivo en ámbito de usuario (arranca la última versión de la extensión bc-ui-verifier)
$launcher = Join-Path $BrowserDir 'en-vivo-launcher.mjs'
if (Test-Path $launcher) { Export-File $launcher (Join-Path $repo 'bc-browser\en-vivo-launcher.mjs') }

# 5. Control de restos sensibles
$userName = $env:USERNAME
$hits = Get-ChildItem (Join-Path $repo '*') -Recurse -File -Include *.md, *.ps1, *.json, *.txt |
    Where-Object { $_.FullName -notlike "*\scripts\*" } |
    Select-String -Pattern ([regex]::Escape($userName)), $guid, '~1\\'
if ($hits) {
    $hits | ForEach-Object { Write-Host "SENSIBLE: $($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
    throw 'Hay datos sensibles en la exportacion. Revisarlos antes de hacer commit.'
}
Write-Host 'Exportacion completada sin datos sensibles detectados. Revisa "git status" y haz commit/push.'
