// npm run maj : installe les zips de mise à jour déposés à la racine du projet.
// Chaque zip contient des fichiers avec leur chemin dans le projet (src/…, public/…, scripts/…).
// Le script les met en place (en remplaçant les anciens), supprime le zip, puis vérifie le code.
import { execSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";

const ALLOWED = /^(src|public|scripts)\//;
const zips = readdirSync(".").filter((f) => f.toLowerCase().endsWith(".zip"));

if (zips.length === 0) {
  console.log("\nAucun zip à la racine du projet. Glisse le zip sur la ligne du dossier du projet dans l’explorateur, puis relance npm run maj.\n");
  process.exit(0);
}

for (const zip of zips) {
  const entries = execSync(`unzip -Z1 "${zip}"`, { encoding: "utf8" }).split("\n").filter((e) => e && !e.endsWith("/"));
  const outside = entries.filter((e) => !ALLOWED.test(e) || e.includes(".."));
  if (outside.length > 0) {
    console.log(`\n✗ ${zip} ignoré : il contient des fichiers hors de src/, public/ ou scripts/ :\n  ${outside.join("\n  ")}\n`);
    continue;
  }
  execSync(`unzip -o -q "${zip}"`);
  rmSync(zip);
  console.log(`\n✓ ${zip} installé, puis supprimé :`);
  for (const e of entries) console.log(`  ${e}`);
}

console.log("\nVérification du code…");
try {
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✓ Code OK\n");
} catch {
  console.log("\n✗ Erreur dans le code : copie le message ci-dessus et envoie-le à Claude.\n");
  process.exit(1);
}
