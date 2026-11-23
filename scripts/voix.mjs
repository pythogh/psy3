// npm run voix -- <id> [options]
// Génère la voix off d'une vidéo avec une synthèse vocale gratuite et locale, PHRASE PAR PHRASE
// (intonation naturelle), puis cale automatiquement chaque plan sur la voix.
//
// Options (toutes facultatives) :
//   --moteur elevenlabs | chatterbox | kokoro   (défaut : elevenlabs)
//   --lister                       ElevenLabs : affiche les voix de ton compte et leur identifiant
//   --voix <identifiant>           ElevenLabs : voix à utiliser
//   --stabilite 0.45               ElevenLabs : plus bas = plus vivant et varié, plus haut = plus régulier
//   --style 0.2                    ElevenLabs : accentuation du style de la voix (0 à 1)
//   --vitesse 1.0                  ElevenLabs et Kokoro : débit (ElevenLabs : 0.7 à 1.2)
//   --expressivite 0.6             Chatterbox : relief de la voix (0.3 posé → 0.9 très expressif)
//   --rythme 0.35                  Chatterbox : plus bas = débit plus lent et posé (0.2 à 0.6)
//   --reference chemin.wav         Chatterbox : voix de référence à imiter (8 à 10 s, propre)
//   --prises 3                     génère 3 versions de chaque phrase, à écouter
//   --choix 4:2,7:3                garde la prise 2 de la phrase 4 et la prise 3 de la phrase 7
//   --sans-whisper                 calage approximatif, sans transcription
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { alignSegments, words } from "./lib/align.mjs";
import { findVideo, loadProps, narrationOf, parseArgs, printTimings, writeTimings } from "./lib/video.mjs";
import { ensureWhisper, transcribeWords } from "./lib/whisper.mjs";
import { listVoices, synthesize } from "./lib/elevenlabs.mjs";

const DIR = path.resolve(".voix");
const ENGINES = {
  chatterbox: {
    venv: path.join(DIR, "venv-chatterbox"),
    install: (pip) => {
      run(pip, ["install", "-q", "torch==2.6.0", "torchaudio==2.6.0", "--index-url", "https://download.pytorch.org/whl/cpu"]);
      run(pip, ["install", "-q", "chatterbox-tts==0.1.7", "soundfile"]);
    },
    files: {
      // Voix de référence française de la démo officielle de Chatterbox
      reference: { file: "reference-fr.flac", url: "https://storage.googleapis.com/chatterbox-demo-samples/mtl_prompts/fr_f1.flac" },
    },
  },
  kokoro: {
    venv: path.join(DIR, "venv"),
    install: (pip) => run(pip, ["install", "-q", "kokoro-onnx==0.6.1", "soundfile"]),
    files: {
      model: { file: "kokoro-v1.0.int8.onnx", url: "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx" },
      voices: { file: "voices-v1.0.bin", url: "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin" },
    },
  },
};

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`Échec : ${cmd} ${args.join(" ")}`);
}

const download = async (url, dest) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible (${res.status}) : ${url}`);
  await finished(Readable.fromWeb(res.body).pipe(createWriteStream(dest)));
};

const setup = async (name) => {
  const engine = ENGINES[name];
  mkdirSync(DIR, { recursive: true });
  const python = path.join(engine.venv, "bin", "python");
  if (!existsSync(python)) {
    console.log(`→ Installation du moteur de voix « ${name} » (une seule fois, plusieurs minutes)…`);
    run("python3", ["-m", "venv", engine.venv]);
    engine.install(path.join(engine.venv, "bin", "pip"));
  }
  const files = {};
  for (const [key, f] of Object.entries(engine.files)) {
    const dest = path.join(DIR, f.file);
    if (!existsSync(dest)) {
      console.log(`→ Téléchargement de ${f.file} (une seule fois)…`);
      await download(f.url, dest);
    }
    files[key] = dest;
  }
  return { python, files };
};

/** Regroupe les plans en phrases : un groupe se ferme sur . ? ! … ou au-delà de 35 mots. */
const groupIntoPhrases = (segments) => {
  const groups = [];
  let current = [];
  segments.forEach((seg, i) => {
    current.push(i);
    const count = current.reduce((n, k) => n + words(segments[k]).length, 0);
    if (/[.?!…]["»”]?$/.test(seg.trim()) || count > 35 || i === segments.length - 1) {
      groups.push(current);
      current = [];
    }
  });
  return groups.map((idx) => ({ shots: idx, text: idx.map((k) => segments[k]).join(" ") }));
};

/** Calage approximatif : à l'intérieur d'une phrase, au prorata du nombre de mots. */
const proportionalStarts = (groups, segments, gStarts, gDurations) => {
  const starts = [];
  groups.forEach((g, gi) => {
    const counts = g.shots.map((k) => Math.max(1, words(segments[k]).length));
    const total = counts.reduce((a, b) => a + b, 0);
    let acc = 0;
    g.shots.forEach((k, j) => {
      starts[k] = gStarts[gi] + (gDurations[gi] * acc) / total;
      acc += counts[j];
    });
  });
  return starts;
};

// ── Programme ─────────────────────────────────────────────────────────────────
const FLAGS = ["--sans-whisper", "--lister"];
const { id: wanted, opts } = parseArgs(process.argv.slice(2).map((a) => (FLAGS.includes(a) ? [a, "1"] : [a])).flat());
const engineName = opts.moteur ?? "elevenlabs";
if (engineName === "elevenlabs" && opts.lister) {
  await listVoices();
  process.exit(0);
}
const { file, id } = findVideo(wanted, "voix");
if (engineName === "elevenlabs") {
  await runElevenLabs();
  process.exit(0);
}
if (!ENGINES[engineName]) {
  console.log(`\nMoteur inconnu : ${engineName}. Choix possibles : ${Object.keys(ENGINES).join(", ")}\n`);
  process.exit(1);
}
const { python, files } = await setup(engineName);

const props = await loadProps(file);
const segments = props.shots.map(narrationOf);
const groups = groupIntoPhrases(segments);
const takes = Math.max(1, Number(opts.prises ?? 1));
const choices = Object.fromEntries(
  (opts.choix ?? "")
    .split(",")
    .filter(Boolean)
    .map((c) => c.split(":").map((x) => x.trim())),
);

mkdirSync("public/voix", { recursive: true });
const output = path.resolve(`public/voix/${id}.wav`);
const takesDir = path.join(DIR, "prises", id);
const resultFile = path.join(DIR, "result.json");
const jobFile = path.join(DIR, "job.json");
const reference = opts.reference ? path.resolve(opts.reference) : files.reference;
writeFileSync(
  jobFile,
  JSON.stringify({
    engine: engineName,
    phrases: groups.map((g) => g.text),
    takes,
    choices,
    takesDir,
    output,
    result: resultFile,
    reference,
    kokoro: { model: files.model, voices: files.voices },
    settings:
      engineName === "chatterbox"
        ? { exaggeration: Number(opts.expressivite ?? 0.6), cfg: Number(opts.rythme ?? 0.35), temperature: Number(opts.temperature ?? 0.8) }
        : { voice: opts.voix ?? "ff_siwis", speed: Number(opts.vitesse ?? 1.0) },
    pauses: { debut: 0.2, phrase: 0.45, deuxPoints: 0.3, fin: 0.6 },
  }),
);

console.log(`→ Voix « ${engineName} » : ${groups.length} phrases pour ${segments.length} plans${takes > 1 ? `, ${takes} prises chacune` : ""}.`);
if (engineName === "chatterbox") console.log("  Sans carte graphique, compter plusieurs minutes. Les prises déjà générées sont réutilisées.");
run(python, ["scripts/voix.py", jobFile]);
const result = JSON.parse(readFileSync(resultFile, "utf8"));

// Calage des plans : Whisper si possible, sinon au prorata des mots
let starts = proportionalStarts(groups, segments, result.starts, result.durations);
let method = "approximatif (au prorata des mots)";
if (!opts["sans-whisper"]) {
  try {
    console.log("→ Calage précis des plans avec Whisper (la première fois : installation de plusieurs minutes)…");
    await ensureWhisper("small");
    const { heard } = await transcribeWords(output, "small");
    const aligned = alignSegments(segments, heard);
    if (aligned.matched >= 0.6) {
      // Un plan ne sort jamais de sa phrase
      starts = aligned.starts.map((t, k) => {
        const gi = groups.findIndex((g) => g.shots.includes(k));
        const lo = result.starts[gi];
        const hi = result.starts[gi] + result.durations[gi];
        return Math.min(Math.max(t - 0.05, lo), hi);
      });
      method = `Whisper (${Math.round(aligned.matched * 100)} % des mots retrouvés)`;
    }
  } catch (err) {
    console.log(`  Whisper indisponible (${err.message.slice(0, 80)}) : calage approximatif.`);
  }
}

const shots = await writeTimings({ file, id, props, starts, audioSrc: `voix/${id}.wav`, audioDuration: result.duration });
printTimings(shots);
console.log(`\n✓ Voix : public/voix/${id}.wav (${result.duration.toFixed(1)} s) — calage ${method}.`);
console.log(`✓ Timings écrits dans ${path.relative(process.cwd(), file)}.`);
if (takes > 1) {
  console.log(`\nPrises à écouter dans ${path.relative(process.cwd(), takesDir)}/ :`);
  groups.forEach((g, i) => console.log(`  phrase ${String(i + 1).padStart(2)}  ${g.text.slice(0, 70)}`));
  console.log(`Puis : npm run voix -- ${id} --prises ${takes} --choix 3:2,5:1   (rien n'est régénéré)`);
}
console.log("");

// ── ElevenLabs : tout le script en une demande, calage par l'horodatage renvoyé ──
async function runElevenLabs() {
  const props = await loadProps(file);
  const segments = props.shots.map(narrationOf);
  const text = segments.join(" ");
  const takes = Math.max(1, Number(opts.prises ?? 1));
  const chosen = Math.min(Math.max(1, Number(opts.choix ?? 1)), takes);
  const common = {
    text,
    voice: opts.voix ?? "21m00Tcm4TlvDq8ikWAM",
    model: opts.modele ?? "eleven_multilingual_v2",
    settings: {
      stability: Number(opts.stabilite ?? 0.45),
      similarity_boost: 0.75,
      style: Number(opts.style ?? 0.2),
      use_speaker_boost: true,
      speed: Number(opts.vitesse ?? 1.0),
    },
    cacheDir: path.join(DIR, "prises", id),
  };
  if (!opts.voix) console.log("  Aucune voix choisie : voix par défaut. Pour choisir : npm run voix -- --lister");
  console.log(`→ Voix ElevenLabs : ${segments.length} plans, ${text.length} caractères${takes > 1 ? `, ${takes} prises` : ""}.`);

  const results = [];
  for (let t = 1; t <= takes; t++) results.push(await synthesize({ ...common, take: t }));
  mkdirSync("public/voix", { recursive: true });
  if (takes > 1) {
    results.forEach((r, i) => writeFileSync(`public/voix/${id}-prise-${i + 1}.mp3`, r.mp3));
    console.log(`  Prises à écouter : public/voix/${id}-prise-1.mp3 à -prise-${takes}.mp3`);
  }
  const { mp3, heard, duration } = results[chosen - 1];
  writeFileSync(`public/voix/${id}.mp3`, mp3);

  const { starts, matched } = alignSegments(segments, heard);
  const shots = await writeTimings({
    file, id, props,
    starts: starts.map((s) => Math.max(0, s - 0.05)), // le texte apparaît une fraction avant le mot
    audioSrc: `voix/${id}.mp3`,
    audioDuration: duration,
  });
  printTimings(shots);
  console.log(`\n✓ Voix : public/voix/${id}.mp3 (${duration.toFixed(1)} s, prise ${chosen}) — calage sur ${Math.round(matched * 100)} % des mots.`);
  console.log(`✓ Timings écrits dans ${path.relative(process.cwd(), file)}.`);
  if (takes > 1) console.log(`  Pour garder une autre prise : npm run voix -- ${id} --prises ${takes} --choix 2   (aucun crédit consommé)`);
  console.log("  Pense à créditer la voix dans ta publication, par exemple « Voix : ElevenLabs ».\n");
}
