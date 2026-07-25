// O content layer do Astro guarda cache em node_modules/.astro/data-store.json.
// Esse cache não invalida sozinho quando um .md é apagado (post "fantasma"
// continua sendo gerado). Limpar antes de cada build evita isso.
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const dir of [".astro", "dist", "node_modules/.astro"]) {
  rmSync(path.join(root, dir), { recursive: true, force: true });
}
