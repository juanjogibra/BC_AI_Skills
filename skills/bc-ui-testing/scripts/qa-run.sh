#!/usr/bin/env bash
# Modo rápido: la librería se carga UNA vez con playwright-output/load.js (page.__qa); cada tarea solo lleva su cuerpo.
# Si una tarea falla con "page.__qa is not a function", volver a ejecutar load.js (el proceso MCP se reinició).
DIR="$(cd "$(dirname "$0")" && pwd)"
rm -f "$DIR/playwright-output/run.js"   # nunca reejecutar una tarea obsoleta
BASE="${QA_BASE:-$(cat "$DIR/qa-base.txt" 2>/dev/null)}"
{
  echo "async (page) => {"
  echo "const L = page.__qa(page, '$BASE');"
  cat
  echo "}"
} > "$DIR/playwright-output/run.js"
echo "OK run.js ($(wc -c < "$DIR/playwright-output/run.js") bytes)"
