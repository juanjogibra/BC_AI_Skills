<#
.SYNOPSIS
  Restaura en este PC las skills, CLAUDE.md global, la memoria y el script del navegador desde el repositorio,
  sustituyendo los marcadores por los valores de este usuario.
.DESCRIPTION
  - {{USERPROFILE}} / {{USERPROFILE_FWD}} / {{MEMORY_SLUG}} -> rutas del usuario actual.
  - {{BC_TENANT_ID}} -> el tenant que se indique (si no se indica, se deja el marcador).
  - Nunca toca carpetas 'privado' existentes (datos de clientes).
  - Si ya existe un CLAUDE.md, guarda una copia .bak-<fecha> antes de sobrescribirlo.
  - La memoria solo se copia si el fichero no existe (salvo -Force).
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\Restore-FromRepo.ps1 -TenantId <guid-del-tenant>
#>
param(
    [string]$TenantId,
    [string]$ClaudeDir = (Join-Path $env:USERPROFILE '.claude'),
    [string]$BrowserDir = (Join-Path $env:USERPROFILE 'bc-browser'),
    [switch]$Force
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$userHome = $env:USERPROFILE
$homeFwd = $userHome -replace '\\', '/'
$memSlug = $userHome -replace '[:\\/]', '-'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$binaryExt = '.png', '.jpg', '.jpeg', '.gif', '.zip', '.app', '.pdf', '.ico'

function Convert-Real([string]$t) {
    $t = $t.Replace('{{USERPROFILE_FWD}}', $homeFwd).Replace('{{USERPROFILE}}', $userHome).Replace('{{MEMORY_SLUG}}', $memSlug)
    if ($TenantId) { $t = $t.Replace('{{BC_TENANT_ID}}', $TenantId) }
    return $t
}

function Restore-File([string]$src, [string]$dst) {
    New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
    if ($binaryExt -contains [IO.Path]::GetExtension($src).ToLower()) { Copy-Item $src $dst -Force; return }
    [IO.File]::WriteAllText($dst, (Convert-Real ([IO.File]::ReadAllText($src))), $utf8)
}

# 1. Skills
$repoSkills = Join-Path $repo 'skills'
Get-ChildItem $repoSkills -Directory | ForEach-Object {
    $skill = $_
    Get-ChildItem $skill.FullName -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($skill.FullName.Length + 1)
        Restore-File $_.FullName (Join-Path $ClaudeDir "skills\$($skill.Name)\$rel")
    }
    New-Item -ItemType Directory -Force -Path (Join-Path $ClaudeDir "skills\$($skill.Name)\privado") | Out-Null
}

# 2. CLAUDE.md
$src = Join-Path $repo 'claude\CLAUDE.md'
$dst = Join-Path $ClaudeDir 'CLAUDE.md'
if (Test-Path $src) {
    if (Test-Path $dst) { Copy-Item $dst "$dst.bak-$(Get-Date -Format yyyyMMdd-HHmmss)" }
    Restore-File $src $dst
}

# 3. Memoria
$memDir = Join-Path $ClaudeDir "projects\$memSlug\memory"
Get-ChildItem (Join-Path $repo 'memory') -File -Filter *.md -ErrorAction SilentlyContinue | ForEach-Object {
    $target = Join-Path $memDir $_.Name
    if ($Force -or -not (Test-Path $target)) { Restore-File $_.FullName $target }
    else { Write-Host "Memoria existente, no se sobrescribe: $($_.Name)" }
}

# 4. Navegador de pruebas
$src = Join-Path $repo 'bc-browser\start-bc-browser.ps1'
if (Test-Path $src) {
    Restore-File $src (Join-Path $BrowserDir 'start-bc-browser.ps1')
    New-Item -ItemType Directory -Force -Path (Join-Path $BrowserDir 'playwright-output') | Out-Null
}
$src = Join-Path $repo 'bc-browser\en-vivo-launcher.mjs'
if (Test-Path $src) {
    Restore-File $src (Join-Path $BrowserDir 'en-vivo-launcher.mjs')
    Write-Host 'bc-en-vivo: para activarlo en ámbito de usuario, añadir mcpServers.bc-en-vivo en ~/.claude.json (ver skill bc-ui-testing) y crear bc-browser\en-vivo-workspace\.vscode\launch.json.'
}

if (-not $TenantId) { Write-Host 'AVISO: sin -TenantId; quedan marcadores {{BC_TENANT_ID}} por sustituir.' }
Write-Host 'Restauracion completada. Siguientes pasos: ver README.md (plugin BCQuality y MCP de Playwright).'
