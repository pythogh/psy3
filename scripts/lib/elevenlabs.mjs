// Voix ElevenLabs. Le texte DIT est généré PARAGRAPHE PAR PARAGRAPHE, chacun avec le contexte de ses
// voisins (intonation continue) et gardé en cache : corriger un paragraphe ne régénère que lui.
// ElevenLabs renvoie l'instant de chaque caractère : calage exact des plans, sans Whisper.
// Clé : variable ELEVENLABS_API_KEY (secret Codespaces) ou fichier .voix/cle-elevenlabs.txt.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const API = "https://api.elevenlabs.io/v1";
const KEY_FILE = path.resolve(".voix/cle-elevenlabs.txt");
// Catégories utilisables par l'API avec un compte gratuit (pas les voix de la bibliothèque)
const FREE_OK = ["premade", "generated", "cloned"];

export const getKey = () => {
  const key = process.env.ELEVENLABS_API_KEY || (existsSync(KEY_FILE) ? readFileSync(KEY_FILE, "utf8").trim() : "");
  if (!key) {
    console.log("\n✗ Clé ElevenLabs introuvable.");
    console.log("  Ajoute-la comme secret Codespaces nommé ELEVENLABS_API_KEY (puis redémarre le Codespace),");
    console.log("  ou colle-la seule dans le fichier .voix/cle-elevenlabs.txt (jamais envoyé sur GitHub).\n");
    process.exit(1);
  }
  return key;
};

const call = async (url, init) => {
  try {
    return await fetch(url, init);
  } catch (err) {
    console.log(`\n✗ Impossible de joindre ElevenLabs (${err.cause?.code ?? err.message}). Vérifie la connexion et réessaie.\n`);
    process.exit(1);
  }
};

const explain = async (res) => {
  const body = await res.text();
  if (res.status === 401) return "clé refusée : vérifie qu'elle est complète et qu'elle autorise « Text to Speech ».";
  if (/library voices/i.test(body))
    return "cette voix vient de la bibliothèque, réservée aux comptes payants via l'API. Choisis une voix marquée ✓ dans : npm run voix -- --lister";
  if (res.status === 429) return "trop de demandes ou quota du mois atteint. Réessaie plus tard.";
  if (/quota|credits/i.test(body)) return "crédits insuffisants pour ce texte ce mois-ci.";
  return `erreur ${res.status} : ${body.slice(0, 200)}`;
};

const fetchVoices = async () => {
  const res = await call(`${API}/voices`, { headers: { "xi-api-key": getKey() } });
  if (!res.ok) {
    console.log(`\n✗ Liste des voix impossible : ${await explain(res)}`);
    console.log("  (Il faut que la clé autorise la lecture des voix : « Voices → Read ».)\n");
    process.exit(1);
  }
  return (await res.json()).voices;
};

/** Affiche les voix du compte ; ✓ = utilisable par l'API avec un compte gratuit. */
export const listVoices = async () => {
  const voices = await fetchVoices();
  console.log("\nVoix de ton compte (✓ = utilisable avec le compte gratuit) :\n");
  voices
    .sort((a, b) => FREE_OK.includes(b.category) - FREE_OK.includes(a.category))
    .forEach((v) => {
      const ok = FREE_OK.includes(v.category) ? "✓" : "✗";
      console.log(`  ${ok}  ${v.voice_id}   ${v.name}`);
    });
  console.log("\nUtilise-en une avec : npm run voix -- --voix <nom ou identifiant>   (ex. --voix Atma)\n");
};

/**
 * Trouve la voix à utiliser : identifiant ou début de nom (« Atma »), sinon la voix enregistrée
 * dans la vidéo, sinon la première voix utilisable du compte.
 * @returns {{ id: string, nom: string }}
 */
export const resolveVoice = async (wanted, saved) => {
  if (!wanted && saved?.id) return { id: saved.id, nom: saved.nom ?? saved.id };
  const voices = await fetchVoices();
  if (wanted) {
    const w = wanted.toLowerCase();
    const v = voices.find((x) => x.voice_id === wanted) ?? voices.find((x) => x.name.toLowerCase().startsWith(w));
    if (!v) {
      console.log(`\n✗ Voix « ${wanted} » introuvable dans ton compte. Vois : npm run voix -- --lister\n`);
      process.exit(1);
    }
    if (!FREE_OK.includes(v.category)) console.log(`  ⚠ « ${v.name} » vient de la bibliothèque : refusée avec un compte gratuit.`);
    return { id: v.voice_id, nom: v.name };
  }
  const v = voices.find((x) => x.category === "premade") ?? voices.find((x) => FREE_OK.includes(x.category));
  if (!v) {
    console.log("\n✗ Aucune voix utilisable avec le compte gratuit. Vois : npm run voix -- --lister\n");
    process.exit(1);
  }
  console.log(`  Aucune voix choisie : « ${v.name} ». Pour en choisir une : npm run voix -- --voix <nom>`);
  return { id: v.voice_id, nom: v.name };
};

const ffprobeDuration = (file) => {
  const r = spawnSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = parseFloat((r.stdout || "").trim());
  return Number.isFinite(d) ? d : undefined;
};

/**
 * Un paragraphe : renvoie le MP3 en cache (ou le génère) et ses mots horodatés.
 * Le contexte (previous/next) améliore l'intonation mais n'entre pas dans la clé du cache :
 * modifier un paragraphe ne force pas à régénérer ses voisins.
 */
const cacheKey = ({ text, voice, model, settings, take }) =>
  createHash("sha1").update(JSON.stringify({ text, voice, model, settings, take })).digest("hex").slice(0, 10);

/** Vrai si ce paragraphe a déjà été généré avec exactement ces réglages (donc gratuit). */
export const isCached = (p) => {
  const hash = cacheKey(p);
  return existsSync(path.join(p.cacheDir, `el-${hash}.json`)) && existsSync(path.join(p.cacheDir, `el-${hash}.mp3`));
};

export const paragraphAudio = async ({ text, previous, next, voice, model, settings, take, cacheDir }) => {
  mkdirSync(cacheDir, { recursive: true });
  const hash = cacheKey({ text, voice, model, settings, take });
  const json = path.join(cacheDir, `el-${hash}.json`);
  const mp3 = path.join(cacheDir, `el-${hash}.mp3`);
  let data;
  let cost = 0;
  if (existsSync(json) && existsSync(mp3)) {
    data = JSON.parse(readFileSync(json, "utf8"));
  } else {
    const res = await call(`${API}/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": getKey(), "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: settings,
        seed: 1000 + take,
        ...(previous ? { previous_text: previous } : {}),
        ...(next ? { next_text: next } : {}),
      }),
    });
    if (!res.ok) {
      console.log(`\n✗ ElevenLabs : ${await explain(res)}\n`);
      process.exit(1);
    }
    const body = await res.json();
    writeFileSync(mp3, Buffer.from(body.audio_base64, "base64"));
    data = { alignment: body.alignment ?? body.normalized_alignment };
    data.duration = ffprobeDuration(mp3);
    writeFileSync(json, JSON.stringify(data));
    cost = text.length;
  }
  const a = data.alignment;
  const heard = [];
  let word = "";
  let start = 0;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (word) heard.push({ text: word, start });
      word = "";
    } else {
      if (!word) start = a.character_start_times_seconds[i];
      word += ch;
    }
  });
  if (word) heard.push({ text: word, start });
  const duration = data.duration ?? Math.max(...a.character_end_times_seconds) + 0.1;
  return { mp3, heard, duration, cost };
};

/**
 * Assemble les paragraphes (avec des silences) en un seul WAV, via le ffmpeg fourni par Remotion.
 */
export const assemble = ({ files, gap, lead, output }) => {
  const args = ["remotion", "ffmpeg", "-y", "-loglevel", "error"];
  const parts = [];
  const silence = (d) => {
    args.push("-f", "lavfi", "-t", String(d), "-i", "anullsrc=r=44100:cl=mono");
    return args.filter((x) => x === "-i").length - 1;
  };
  parts.push(silence(lead));
  files.forEach((f, i) => {
    args.push("-i", f);
    parts.push(args.filter((x) => x === "-i").length - 1);
    if (i < files.length - 1) parts.push(silence(gap));
  });
  const filters = parts.map((p, i) => `[${p}:a]aresample=44100,aformat=sample_fmts=s16:channel_layouts=mono[a${i}]`);
  const concat = `${parts.map((_, i) => `[a${i}]`).join("")}concat=n=${parts.length}:v=0:a=1[out]`;
  args.push("-filter_complex", [...filters, concat].join(";"), "-map", "[out]", output);
  const r = spawnSync("npx", args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error("Assemblage audio impossible.");
};
