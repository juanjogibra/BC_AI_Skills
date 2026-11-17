# Abre Edge con depuracion remota (puerto 9222) y un perfil dedicado a pruebas de BC.
# - Claude lo controla con el MCP "playwright" (--cdp-endpoint http://127.0.0.1:9222).
# - Se ve dentro de VS Code con Microsoft Edge Tools: Ctrl+Shift+P > "Microsoft Edge Tools: Attach to a target" > Screencast.
# Cerrar Edge al terminar: mientras el puerto esta abierto, cualquier proceso local puede controlarlo.
# Por defecto arranca sin ventana (headless) para verlo solo en VS Code; -Visible muestra la ventana
# (necesario si Microsoft pide login/MFA interactivo). -Restart cierra antes la instancia de pruebas.
param(
    [string]$Url = 'https://businesscentral.dynamics.com/{{BC_TENANT_ID}}/Preproduction',
    [int]$Port = 9222,
    [switch]$Visible,
    [switch]$Restart
)

if ($Restart) {
    Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" |
        Where-Object { $_.CommandLine -like '*bc-browser\profile*' } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

$edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'No se encuentra msedge.exe' }

$profileDir = Join-Path $PSScriptRoot 'profile'

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
    Write-Host "Edge arrancado con depuracion en el puerto $Port."
}
