<#
.SYNOPSIS
  Extrae el código fuente .al de un paquete .app de BC (p. ej. Microsoft_Base Application_*.app de .alpackages)
  para poder buscar en él (textos de error, eventos, codeunits de registro).
.EXAMPLE
  powershell -File Expand-ALSource.ps1 -AppFile "<proyecto>\.alpackages\Microsoft_Base Application_29.1.x.app" -Destination "<scratchpad>\BaseApp-29.1"
.NOTES
  Un .app es un zip precedido por una cabecera NAVX de 40 bytes. Solo trae .al si el paquete incluye fuentes
  (los de Microsoft descargados como símbolos sí las traen). Usar la versión que corresponda al entorno probado.
#>
param(
    [Parameter(Mandatory)] [string] $AppFile,
    [Parameter(Mandatory)] [string] $Destination
)
Add-Type -AssemblyName System.IO.Compression
[byte[]] $bytes = [System.IO.File]::ReadAllBytes($AppFile)
$offset = 0
if ([System.Text.Encoding]::ASCII.GetString($bytes, 0, 4) -eq 'NAVX') { $offset = 40 }
$ms = [System.IO.MemoryStream]::new($bytes, $offset, [int]$bytes.Length - $offset)
$zip = [System.IO.Compression.ZipArchive]::new($ms)
$n = 0
foreach ($e in $zip.Entries) {
    if ($e.FullName -notlike '*.al') { continue }
    $target = Join-Path $Destination ([System.Uri]::UnescapeDataString($e.FullName))
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    $in = $e.Open(); $out = [System.IO.File]::Create($target)
    $in.CopyTo($out); $out.Dispose(); $in.Dispose(); $n++
}
$zip.Dispose()
"Extraidos $n ficheros .al en $Destination"
