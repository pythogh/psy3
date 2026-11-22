// npm run synchro -- <id> [--audio public/voix/fichier.mp3] [--modele small]
// Pour une voix enregistrée (ElevenLabs, autre outil…) : Whisper écoute le fichier, repère à
// quelle seconde chaque mot est prononcé, et cale automatiquement chaque plan dessus.
// Le premier lancement installe Whisper et télécharge son modèle (plusieurs minutes).
import { existsSync } from "node:fs";
import path from "node:path";
import { alignSegments } from "./lib/align.mjs";
import { findVideo, loadProps, narrationOf, parseArgs, printTimings, writeTimings } from "./lib/video.mjs";
import { ensureWhisper, transcribeWords } from "./lib/whisper.mjs";

const { id: wanted, opts } = parseArgs(process.argv.slice(2));
const { file, id } = findVideo(wanted, "synchro");
const props = await loadProps(file);

const candidates = [
  opts.audio,
  props.audio?.src && path.join("public", props.audio.src),
  ...["mp3", "wav", "m4a"].map((ext) => `public/voix/${id}.${ext}`),
].filter(Boolean);
const audio = candidates.find((p) => existsSync(p));
if (!audio || !path.resolve(audio).startsWith(path.resolve("public"))) {
  console.log(`\nAucun fichier audio trouvé dans public/. Dépose la voix off dans public/voix/${id}.mp3 (ou .wav, .m4a),`);
  console.log(`ou indique son chemin : npm run synchro -- ${id} --audio public/voix/mon-fichier.mp3\n`);
  process.exit(1);
}

const model = opts.modele ?? "small";
try {
  console.log("→ Vérification de Whisper (la première fois : installation de plusieurs minutes)…");
  await ensureWhisper(model);
} catch (err) {
  console.log(`\n✗ Installation de Whisper impossible : ${err.message}`);
  console.log("  Vérifie la connexion internet et relance. Si l'erreur persiste, supprime .voix/whisper.cpp et relance.\n");
  process.exit(1);
}
console.log(`→ Écoute de ${audio}…`);
const { heard, duration } = await transcribeWords(audio, model);
const { starts, matched } = alignSegments(props.shots.map(narrationOf), heard);
const shots = await writeTimings({
  file, id, props,
  starts: starts.map((t) => Math.max(0, t - 0.05)), // le texte apparaît une fraction avant le mot
  audioSrc: path.relative("public", audio).split(path.sep).join("/"),
  audioDuration: duration,
});
printTimings(shots);
console.log(`\n✓ ${Math.round(matched * 100)} % des mots du script retrouvés dans l'audio.`);
if (matched < 0.7) console.log("  ⚠ Peu de mots retrouvés : vérifie que l'audio lit bien le texte des plans (champ narration).");
console.log(`✓ Timings écrits dans ${path.relative(process.cwd(), file)}. Vérifie avec npm run dev ou npm run planche.\n`);
