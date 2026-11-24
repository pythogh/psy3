// Petit lanceur pour toutes les commandes du projet (avec ou sans nom de vidéo).
// S'il n'y a qu'une vidéo dans src/data/videos/, pas besoin de donner son nom.
//
//   npm run planche     -- <id>   planche contact          → out/<id>-planche.png
//   npm run render      -- <id>   vidéo                    → out/<id>.mp4
//   npm run vignette    -- <id>   vignette (couverture)    → out/<id>-vignette.png
//   npm run export      -- <id>   vidéo + vignette
//   npm run verifier    -- <id>   code + synchro + planche (options de synchro acceptées, ex. --audio …)
//   npm run telecharger           ouvre le dossier out/ dans le navigateur pour télécharger
import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const [mode, ...rest] = process.argv.slice(2);
const wanted = rest[0] && !rest[0].startsWith("--") ? rest[0] : undefined;
const options = wanted ? rest.slice(1) : rest;
const browser = process.env.REMOTION_BROWSER ? ["--browser-executable", process.env.REMOTION_BROWSER] : [];

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) {
    console.log(`\n✗ Échec de : ${cmd} ${args.join(" ")}\n`);
    process.exit(r.status ?? 1);
  }
};

// Téléchargement : pas besoin de nom de vidéo
if (mode === "telecharger") {
  console.log("\nOuvre la notification « Open in Browser » (jamais « Make Public »),");
  console.log("clique sur les fichiers à télécharger, puis Ctrl+C ici pour arrêter.\n");
  run("npx", ["--yes", "http-server", "out", "-p", "8000", "-c-1"]);
  process.exit(0);
}

const ids = readdirSync("src/data/videos")
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(`src/data/videos/${f}`, "utf8").match(/id="([^"]+)"/)?.[1])
  .filter(Boolean);

const id = wanted ?? (ids.length === 1 ? ids[0] : undefined);
if (!id || !ids.includes(id)) {
  console.log(`\nIndique la vidéo : npm run ${mode} -- <nom>\nVidéos disponibles : ${ids.join(", ")}\n`);
  process.exit(1);
}

const planche = () => {
  run("npx", ["remotion", "still", "src/index.ts", id, `out/${id}-planche.png`, "--props", JSON.stringify({ planche: true }), ...browser]);
  console.log(`\n✓ Planche prête : out/${id}-planche.png\n`);
};
const render = () => {
  run("npx", ["remotion", "render", "src/index.ts", id, `out/${id}.mp4`, ...browser]);
  console.log(`\n✓ Vidéo prête : out/${id}.mp4\n`);
};
// Image 40 : après l'apparition de la mascotte (la vignette dure 2 s)
const vignette = () => {
  run("npx", ["remotion", "still", "src/index.ts", `${id}-vignette`, `out/${id}-vignette.png`, "--frame=40", ...browser]);
  console.log(`\n✓ Vignette prête : out/${id}-vignette.png\n`);
};

if (mode === "planche") planche();
else if (mode === "render") render();
else if (mode === "vignette") vignette();
else if (mode === "export") {
  render();
  vignette();
  console.log("Pour télécharger : npm run telecharger\n");
} else if (mode === "verifier") {
  console.log("\n1/3 Vérification du code…");
  run("npx", ["tsc", "--noEmit"]);
  console.log("2/3 Calage des plans sur la voix…");
  run("node", ["scripts/synchro.mjs", id, ...options]);
  console.log("3/3 Planche…");
  planche();
} else {
  console.log(`\nCommande inconnue : ${mode}\n`);
  process.exit(1);
}
