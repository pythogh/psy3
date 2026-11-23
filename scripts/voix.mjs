// npm run voix -- <id> [options]
// Génère la voix off d'une vidéo avec une synthèse vocale gratuite et locale, PHRASE PAR PHRASE
// (intonation naturelle), puis cale automatiquement chaque plan sur la voix.
//
// Options (toutes facultatives) :
//   --moteur elevenlabs | chatterbox | kokoro   (défaut : elevenlabs)
//
//   ElevenLabs — le texte DIT est le champ `script` de la vidéo (un paragraphe par ligne) ;
//   à défaut, le texte des plans. Chaque paragraphe est gardé en cache.
//   --lister                       affiche les voix de ton compte (✓ = utilisables en gratuit)
//   --voix Atma                    voix à utiliser (nom ou identifiant) ; enregistrée dans la vidéo
//   --essai                        génère seulement le 1er paragraphe → public/voix/essai-<voix>-….wav
//   --essai "Une phrase de test."  génère seulement cette phrase
//   --stabilite 0.45               plus bas = plus vivant et varié, plus haut = plus régulier
//   --style 0.2                    accentuation du style de la voix (0 à 1)
//   --vitesse 1.0                  débit (0.7 à 1.2)
//   --prise 2                      autre version de chaque paragraphe (nouvelle génération)
//   --oui                          ne pas demander de confirmation avant de consommer des crédits
//
//   Chatterbox et Kokoro (locaux, gratuits, plus lents ou plus mécaniques) :
//   --expressivite 0.6  --rythme 0.35  --reference fichier.wav  --prises 3  --choix 4:2,7:3  --vitesse 1.0
//   --sans-whisper                 calage approximatif, sans transcription
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { alignSegments, words } from "./lib/align.mjs";
import { findVideo, loadProps, narrationOf, parseArgs, printTimings, writeTimings } from "./lib/video.mjs";
import { ensureWhisper, transcribeWords } from "./lib/whisper.mjs";
import { assemble, isCached, listVoices, paragraphAudio, resolveVoice } from "./lib/elevenlabs.mjs";
import { createInterface } from "node:readline/promises";

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
const { id: wanted, opts } = parseArgs(process.argv.slice(2));
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

// ── ElevenLabs : le texte dit, paragraphe par paragraphe, puis calage des plans ─────────
/** À défaut de `script`, reconstitue un texte dit à partir des plans, en paragraphes d'environ 280 caractères. */
function autoParagraphs(segments) {
  const sentences = segments.join(" ").match(/[^.?!…]+[.?!…]+["»”]?|[^.?!…]+$/g) ?? [];
  const paras = [];
  let cur = "";
  for (const s of sentences.map((x) => x.trim()).filter(Boolean)) {
    if (cur && cur.length + s.length > 280) paras.push(cur), (cur = "");
    cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) paras.push(cur);
  return paras;
}

/** Demande confirmation avant de consommer des crédits (sauf --oui, ou si rien n'est à générer). */
async function confirmCost(credits) {
  if (credits === 0) return true;
  console.log(`  Cette génération va consommer environ ${credits} crédits ElevenLabs.`);
  if (opts.oui || !process.stdin.isTTY) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question("  Continuer ? (o/n) ")).trim().toLowerCase();
  rl.close();
  if (answer.startsWith("o") || answer.startsWith("y")) return true;
  console.log("  Annulé : aucun crédit consommé.\n");
  return false;
}

async function runElevenLabs() {
  const props = await loadProps(file);
  const saved = props.voix ?? {};
  const voice = await resolveVoice(opts.voix, saved);
  const stabilite = Number(opts.stabilite ?? saved.stabilite ?? 0.45);
  const style = Number(opts.style ?? saved.style ?? 0.2);
  const vitesse = Number(opts.vitesse ?? saved.vitesse ?? 1.0);
  const modele = opts.modele ?? saved.modele ?? "eleven_multilingual_v2";
  const common = {
    voice: voice.id,
    model: modele,
    settings: { stability: stabilite, similarity_boost: 0.75, style, use_speaker_boost: true, speed: vitesse },
    take: Number(opts.prise ?? 1),
    cacheDir: path.join(DIR, "cache-elevenlabs"),
  };
  const segments = props.shots.map(narrationOf);
  const paragraphs = (props.script?.length ? props.script : autoParagraphs(segments)).map((p) => p.trim()).filter(Boolean);
  mkdirSync("public/voix", { recursive: true });

  // Essai : un seul paragraphe (ou une phrase donnée), sans toucher à la vidéo
  if ("essai" in opts) {
    if (!opts.essai.trim()) {
      console.log('\n✗ La phrase d\'essai est vide (variable non définie dans ce terminal ?). Rien n\'a été généré.');
      console.log('  Écris la phrase directement : npm run voix -- --voix Sarah --essai "Ta phrase ici."\n');
      process.exit(1);
    }
    const text = opts.essai !== "1" ? opts.essai : paragraphs[0];
    if (!(await confirmCost(isCached({ ...common, text }) ? 0 : text.length))) return;
    console.log(`→ Essai avec « ${voice.nom} » : ${text.length} caractères.`);
    const r = await paragraphAudio({ ...common, text });
    // Un fichier par voix et par réglage : on peut comparer sans rien renommer
    const slug = voice.nom.split(/[\s-]/)[0].toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
    const out = `public/voix/essai-${slug}-st${stabilite}-v${vitesse}.wav`;
    assemble({ files: [r.mp3], gap: 0, lead: 0.1, output: path.resolve(out) });
    console.log(r.cost ? `  ${r.cost} crédits consommés.` : "  Déjà généré : aucun crédit consommé.");
    console.log(`✓ Écoute ${out} (clic dans l'explorateur de gauche).`);
    console.log(`  Réglages : stabilité ${stabilite}, style ${style}, vitesse ${vitesse}.\n`);
    return;
  }

  console.log(`→ Voix « ${voice.nom} » : ${paragraphs.length} paragraphes${props.script?.length ? " (champ script)" : " (reconstitués depuis les plans)"}.`);
  const toPay = paragraphs.filter((p) => !isCached({ ...common, text: p })).reduce((n, p) => n + p.length, 0);
  if (!(await confirmCost(toPay))) return;
  const LEAD = 0.15;
  const GAP = 0.5;
  let cursor = LEAD;
  let credits = 0;
  const files = [];
  const heard = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const r = await paragraphAudio({
      ...common,
      text: paragraphs[i],
      previous: paragraphs[i - 1]?.slice(-300),
      next: paragraphs[i + 1]?.slice(0, 300),
    });
    console.log(`  ${String(i + 1).padStart(2)}. ${r.cost ? `généré (${r.cost} crédits)` : "en cache"}  ${paragraphs[i].slice(0, 60)}…`);
    credits += r.cost;
    files.push(r.mp3);
    r.heard.forEach((h) => heard.push({ text: h.text, start: h.start + cursor }));
    cursor += r.duration + (i < paragraphs.length - 1 ? GAP : 0);
  }
  const duration = cursor + 0.3;
  assemble({ files, gap: GAP, lead: LEAD, output: path.resolve(`public/voix/${id}.wav`) });

  const extra = { voix: { ...saved, id: voice.id, nom: voice.nom, stabilite, style, vitesse, ...(opts.modele ? { modele } : {}) } };
  if (props.shots.length === 0) {
    await writeTimings({ file, id, props, starts: [], audioSrc: `voix/${id}.wav`, audioDuration: duration, extra });
    console.log(`\n✓ Voix : public/voix/${id}.wav (${duration.toFixed(1)} s) — ${credits} crédits consommés.`);
    console.log("  Pas encore de plans : écoute l'audio, ajuste le script, puis fais faire le découpage.\n");
    return;
  }
  const { starts, matched } = alignSegments(segments, heard);
  const shots = await writeTimings({
    file, id, props,
    starts: starts.map((t) => Math.max(0, t - 0.05)), // le texte apparaît une fraction avant le mot
    audioSrc: `voix/${id}.wav`,
    audioDuration: duration,
    extra,
  });
  printTimings(shots);
  console.log(`\n✓ Voix : public/voix/${id}.wav (${duration.toFixed(1)} s) — ${credits} crédits consommés.`);
  console.log(`✓ Plans calés (${Math.round(matched * 100)} % des mots des plans retrouvés dans la voix). Voix enregistrée dans la vidéo.`);
  if (matched < 0.6) console.log("  ⚠ Peu de mots retrouvés : le texte des plans s'éloigne beaucoup du script dit.");
  console.log("  Pense à créditer la voix dans ta publication, par exemple « Voix : ElevenLabs ».\n");
}
