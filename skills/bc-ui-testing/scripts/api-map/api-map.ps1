param([string[]]$Roots, [string]$Out)
$tables = @{}
$rows = @()
foreach ($r in $Roots) {
  foreach ($f in Get-ChildItem $r -Recurse -Filter *.al) {
    $t = [IO.File]::ReadAllText($f.FullName)
    if ($t -match '(?m)^\s*table\s+(\d+)\s+"?([^"\r\n{]+?)"?\s*(\r|\n|\{)') { $tables[$Matches[2].Trim()] = $Matches[1] }
    if ($t -notmatch '(?i)(PageType|QueryType)\s*=\s*API\s*;') { continue }
    if ($t -notmatch '(?mi)^\s*(page|query)\s+(\d+)\s+"?([^"\r\n{]+?)"?\s*(\r|\n|\{)') { continue }
    $kind = $Matches[1]; $id = $Matches[2]; $name = $Matches[3].Trim()
    $get = { param($p) if ($t -match "(?i)\b$p\s*=\s*([^;]+);") { ($Matches[1] -replace "'", '').Trim() } else { '' } }
    $pub = & $get 'APIPublisher'; $grp = & $get 'APIGroup'; $ver = & $get 'APIVersion'; $es = & $get 'EntitySetName'
    if ($kind -eq 'page') { $src = (& $get 'SourceTable') -replace '"', '' ; $tmp = & $get 'SourceTableTemporary' }
    else { $src = if ($t -match '(?i)dataitem\s*\(\s*\w+\s*;\s*"?([^")\r\n]+)"?\s*\)') { $Matches[1].Trim() } else { '' }; $tmp = '' }
    $src = $src -replace '^(?i)Microsoft\.[\w\.]+\.', ''
    foreach ($v in ($ver -split ',')) {
      $route = if ($pub) { "$pub/$grp/$($v.Trim())" } else { $v.Trim() }
      $rows += [pscustomobject]@{ Ruta = $route; Entidad = $es; Objeto = "$kind $id $name"; Tabla = $src; Temporal = ($tmp -match 'true') }
    }
  }
}
$rows | ForEach-Object { $_ | Add-Member TablaId ($tables[$_.Tabla]) -PassThru } | Sort-Object Ruta, Entidad | Export-Csv $Out -NoTypeInformation -Encoding UTF8
"filas: $($rows.Count)"
