// Lanzador del MCP bc-en-vivo en ámbito de usuario: arranca la versión más reciente instalada de la extensión
// bc-ui-verifier (la ruta cambia con cada actualización). Mismo ejecutable y entorno que recibe (Code.exe + ELECTRON_RUN_AS_NODE).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const extDir = path.join(process.env.USERPROFILE || '', '.vscode', 'extensions');
const ver = s => (s.match(/bc-ui-verifier-([\d.]+)/)?.[1] || '0').split('.').map(Number);
const cmp = (a, b) => { const x = ver(a), y = ver(b); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
const dirs = fs.readdirSync(extDir).filter(d => /^actio-procesos-y-tecnologia\.bc-ui-verifier-/.test(d)).sort(cmp);
const script = dirs.length && path.join(extDir, dirs[dirs.length - 1], 'runtime', 'scripts', 'en-vivo.mjs');
if (!script || !fs.existsSync(script)) { process.stderr.write('bc-en-vivo: no se encuentra la extensión bc-ui-verifier en ' + extDir + '\n'); process.exit(1); }

const child = spawn(process.execPath, [script, ...process.argv.slice(2)], { stdio: 'inherit', env: process.env });
child.on('exit', code => process.exit(code ?? 0));
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => child.kill(s));
