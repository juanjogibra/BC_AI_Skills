# Descarga del entorno (dev/packages, sirve con la app S2S) los paquetes de las apps Microsoft instaladas y extrae .al / SymbolReference.json
# CompanyId: Invoke-BCApi 'companies'
param([string]$Dest, [Parameter(Mandatory)][string]$CompanyId)
. "$env:USERPROFILE\bc-browser\bc-api.ps1"
$c = $CompanyId
$ext = Invoke-BCApi "companies($c)/extensions" -Api 'microsoft/automation/v2.0' | Where-Object { $_.publisher -eq 'Microsoft' -and $_.isInstalled }
$sel = $ext | Where-Object { $_.displayName -match 'Power BI|API|Fabric|Excise|^Expense Agent \(|^Subscription Billing$|VAT Group|Cloud Migration API|Report|Dataverse|Intercompany|Automate|Analytics' -and $_.displayName -notmatch 'Demo|_Exclude_APIV2_' }
New-Item -ItemType Directory -Force $Dest | Out-Null
$t = Get-BCToken
foreach ($x in $sel) {
  $out = Join-Path $Dest (($x.displayName -replace '[^\w\-]', '_') + '.app')
  if (Test-Path $out) { continue }
  $u = "https://api.businesscentral.dynamics.com/v2.0/$($cfg.tenant)/$($cfg.environment)/dev/packages?publisher=Microsoft&appName=$([uri]::EscapeDataString($x.displayName))&versionText=$($x.versionMajor).0.0.0&appId=$($x.id)"
  try { Invoke-WebRequest -UseBasicParsing -Uri $u -Headers @{ Authorization = "Bearer $t" } -OutFile $out; "$($x.displayName): $((Get-Item $out).Length)" } catch { "$($x.displayName): ERROR $($_.Exception.Message)" }
}
# extraer .al y SymbolReference.json de cada paquete
Add-Type -AssemblyName System.IO.Compression
foreach ($f in Get-ChildItem $Dest -Filter *.app) {
  $d = Join-Path $Dest ($f.BaseName); if (Test-Path $d) { continue }
  $b = [IO.File]::ReadAllBytes($f.FullName); $o = if ([Text.Encoding]::ASCII.GetString($b, 0, 4) -eq 'NAVX') { 40 } else { 0 }
  $z = [IO.Compression.ZipArchive]::new([IO.MemoryStream]::new($b, $o, $b.Length - $o)); $n = 0
  foreach ($e in $z.Entries) { if ($e.FullName -notmatch '\.al$|SymbolReference\.json$') { continue }
    $tg = Join-Path $d ([Uri]::UnescapeDataString($e.FullName)); New-Item -ItemType Directory -Force (Split-Path $tg) | Out-Null
    $i = $e.Open(); $w = [IO.File]::Create($tg); $i.CopyTo($w); $w.Dispose(); $i.Dispose(); $n++ }
  $z.Dispose(); "$($f.BaseName): $n ficheros"
}
