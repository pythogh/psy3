// Petit lanceur : `npm run planche` / `npm run render` (avec ou sans nom de vidéo).
// S'il n'y a qu'une vidéo dans src/data/videos/, pas besoin de donner son nom.
import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const [mode, wanted] = process.argv.slice(2);
const ids = readdirSync("src/data/videos")
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => readFileSync(`src/data/videos/${f}`, "utf8").match(/id="([^"]+)"/)?.[1])
  .filter(Boolean);

const id = wanted ?? (ids.length === 1 ? ids[0] : undefined);
if (!id || !ids.includes(id)) {
  console.log(`\nIndique la vidéo : npm run ${mode} -- <nom>\nVidéos disponibles : ${ids.join(", ")}\n`);
  process.exit(1);
}

const args =
  mode === "planche"
    ? ["remotion", "still", "src/index.ts", id, `out/${id}-planche.png`, "--props", JSON.stringify({ planche: true })]
    : ["remotion", "render", "src/index.ts", id, `out/${id}.mp4`];
const extra = process.env.REMOTION_BROWSER ? ["--browser-executable", process.env.REMOTION_BROWSER] : [];
const r = spawnSync("npx", [...args, ...extra], { stdio: "inherit" });
if (r.status === 0) console.log(`\n✓ Fichier prêt : ${args[4]}\n`);
process.exit(r.status ?? 1);
