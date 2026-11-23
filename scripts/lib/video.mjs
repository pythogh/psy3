// Outils partagés par `npm run voix` et `npm run synchro` :
// trouver une vidéo, lire ses plans, réécrire ses timings dans son fichier.
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();
const VIDEOS_DIR = path.join(ROOT, "src/data/videos");

/** Lit les arguments : `<id>` (optionnel s'il n'y a qu'une vidéo) et des options `--nom valeur`. */
export const parseArgs = (argv) => {
  const opts = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) opts[argv[i].slice(2)] = argv[i + 1], i++;
    else positional.push(argv[i]);
  }
  return { id: positional[0], opts };
};

/** Retrouve le fichier de la vidéo à partir de son id (ou la seule vidéo du projet). */
export const findVideo = (wanted, command) => {
  if (!existsSync(VIDEOS_DIR)) {
    console.log("\nAucune vidéo dans le projet : le dossier src/data/videos/ est introuvable.");
    console.log("Ajoute au moins un fichier de vidéo (.tsx) dans src/data/videos/ et déclare-le dans src/data/index.tsx.\n");
    process.exit(1);
  }
  const videos = readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => {
      const file = path.join(VIDEOS_DIR, f);
      const id = readFileSync(file, "utf8").match(/id="([^"]+)"/)?.[1];
      return { file, id };
    })
    .filter((v) => v.id);
  const found = wanted ? videos.find((v) => v.id === wanted) : videos.length === 1 ? videos[0] : undefined;
  if (!found) {
    console.log(`\nIndique la vidéo : npm run ${command} -- <id>\nVidéos disponibles : ${videos.map((v) => v.id).join(", ")}\n`);
    process.exit(1);
  }
  return found;
};

/** Charge les réglages (defaultProps) d'une vidéo en compilant son fichier à la volée. */
export const loadProps = async (file) => {
  const esbuild = require("esbuild");
  const tmpDir = path.join(ROOT, ".voix/tmp");
  mkdirSync(tmpDir, { recursive: true });
  const out = path.join(tmpDir, `props-${Date.now()}.mjs`);
  await esbuild.build({
    entryPoints: [file],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: out,
    jsx: "automatic",
    packages: "external",
    logLevel: "silent",
  });
  const mod = await import(pathToFileURL(out).href);
  rmSync(out, { force: true });
  const Comp = Object.values(mod).find((v) => typeof v === "function");
  // Le composant renvoie <Composition defaultProps={...} /> : on lit directement ses props.
  const element = Comp();
  return element.props.defaultProps;
};

/** Texte que la voix doit lire pour un plan : la narration, sinon le texte affiché. */
export const narrationOf = (shot) =>
  (shot.narration ?? shot.text)
    .replace(/\s*\|\s*/g, " ")
    .replace(/[\u00A0\u202F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Écrit les nouveaux timings dans le fichier de la vidéo, avec le même mécanisme que le Studio.
 * starts[i] = seconde où commence le plan i dans l'audio.
 */
export const writeTimings = async ({ file, id, props, starts, audioSrc, audioDuration }) => {
  const { setCompositionDefaultProps } = require("@remotion/codemods");
  starts = [0, ...starts.slice(1)]; // la vidéo commence toujours par le premier plan
  const shots = props.shots.map((shot, i) => {
    const start = round(starts[i]);
    const next = starts[i + 1];
    let duration;
    if (next !== undefined) duration = round(next - starts[i]);
    else duration = round(Math.max(shot.duration, audioDuration - starts[i] + 0.8)); // dernier plan : garde sa respiration
    return { ...shot, startAt: start, duration: Math.max(0.3, duration) };
  });
  const next = { ...props, audio: { ...(props.audio ?? {}), src: audioSrc }, shots };
  const contents = readFileSync(file, "utf8");
  const result = setCompositionDefaultProps({
    project: { files: { [file]: contents }, rootDir: ROOT },
    compositionFile: file,
    compositionId: id,
    defaultProps: JSON.parse(JSON.stringify(next)),
  });
  const output = result.changes[0]?.nextContents ?? contents;
  writeFileSync(file, output);
  return shots;
};

const round = (n) => Math.round(n * 100) / 100;

/** Résumé lisible des timings écrits. */
export const printTimings = (shots) => {
  shots.forEach((s, i) => {
    const words = (s.narration ?? s.text).replace(/\|/g, " ").split(/\s+/).filter(Boolean).length;
    console.log(`  ${String(i + 1).padStart(2)}  ${s.startAt.toFixed(2).padStart(6)} s  ${s.duration.toFixed(2).padStart(5)} s  ${words} mots  ${s.text.replace(/\s*\|\s*/g, " ").slice(0, 42)}`);
  });
};
