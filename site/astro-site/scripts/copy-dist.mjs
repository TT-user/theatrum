// Copia o output do build (dist/) pro /blog na raiz do repo Theatrum,
// que é o que o Hostinger de fato serve (git auto-deploy, sem build step).
import { cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, "..", "dist");
const dest = path.join(here, "..", "..", "..", "blog");

if (!existsSync(dist)) {
  console.error(`dist/ não encontrado em ${dist} — rode "npm run build" antes.`);
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(dist, dest, { recursive: true });

console.log(`Copiado: ${dist} -> ${dest}`);
