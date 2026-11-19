# Abre Edge con depuracion remota (puerto 9222) y un perfil dedicado a pruebas de BC.
# - Claude lo controla con el MCP "playwright" (--cdp-endpoint http://127.0.0.1:9222).
# - Se ve dentro de VS Code con Microsoft Edge Tools: Ctrl+Shift+P > "Microsoft Edge Tools: Attach to a target" > Screencast.
# Cerrar Edge al terminar: mientras el puerto esta abierto, cualquier proceso local puede controlarlo.
# Por defecto arranca sin ventana (headless) para verlo solo en VS Code; -Visible muestra la ventana
# (necesario si Microsoft pide login/MFA interactivo). -Restart cierra antes la instancia de pruebas.
param(
    [string]$Url = 'https://businesscentral.dynamics.com/{{BC_TENANT_ID}}/Preproduction',
    [int]$Port = 9222,
    [string]$Name = '',
    [switch]$Visible,
    [switch]$Restart,
    [ValidateSet('chrome', 'edge')] [string]$Browser = 'chrome'   # Chrome por defecto (preferencia del usuario, 19/11/2026)
)

# -Name: navegador independiente por cliente/entorno (perfil 'profile-<Name>' con su propio login).
#   Ej.: -Name cliente1 -Port 9223. Sin -Name: perfil 'profile' (puerto 9222 por defecto).
#   Cada proyecto apunta a su puerto con un MCP 'playwright' en ambito local (~/.claude.json > projects).
$base = if ($Name) { "profile-$Name" } else { 'profile' }
if ($Browser -eq 'chrome') { $base += '-chrome' }   # Chrome no puede usar el perfil de Edge: perfil propio
$profileDir = Join-Path $PSScriptRoot $base

if ($Restart) {
    # Cierra la instancia de ESTE perfil y cualquier navegador de pruebas que ocupe el puerto (Edge o Chrome)
    $profilePattern = [regex]::Escape($profileDir) + '("|\s|$)'
    Get-CimInstance Win32_Process -Filter "Name='msedge.exe' OR Name='chrome.exe'" |
        Where-Object { $_.CommandLine -match $profilePattern -or $_.CommandLine -match "--remote-debugging-port=$Port\b" } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

$candidatos = if ($Browser -eq 'chrome') {
    @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe")
} else {
    @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
}
$edge = $candidatos | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "No se encuentra el ejecutable de $Browser" }


try {
    $null = Invoke-RestMethod "http://127.0.0.1:$Port/json/version" -TimeoutSec 2
    Write-Host "Ya hay un navegador escuchando en el puerto $Port."
} catch {
    $edgeArgs = @(
        "--remote-debugging-port=$Port",
        "--remote-debugging-address=127.0.0.1",
        "--user-data-dir=`"$profileDir`"",
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1600,1000'
    )
    if (-not $Visible) { $edgeArgs += '--headless=new' }
    Start-Process $edge -ArgumentList ($edgeArgs + $Url)
    foreach ($i in 1..20) {
        Start-Sleep -Milliseconds 500
        try { $null = Invoke-RestMethod "http://127.0.0.1:$Port/json/version" -TimeoutSec 2; break } catch {}
    }
    Write-Host "$Browser arrancado con depuracion en el puerto $Port (perfil $base)."
}
