// Voix ElevenLabs (compte gratuit possible) : le script entier en une seule demande, pour une
// intonation continue. ElevenLabs renvoie l'instant de chaque caractère : calage exact, sans Whisper.
// La clé se lit dans la variable ELEVENLABS_API_KEY (secret Codespaces) ou dans .voix/cle-elevenlabs.txt.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const API = "https://api.elevenlabs.io/v1";
const KEY_FILE = path.resolve(".voix/cle-elevenlabs.txt");
// Catégories de voix utilisables par l'API avec un compte gratuit (les voix de la bibliothèque ne le sont pas)
const FREE_OK = ["premade", "generated", "cloned"];

export const getKey = () => {
  const key = process.env.ELEVENLABS_API_KEY || (existsSync(KEY_FILE) ? readFileSync(KEY_FILE, "utf8").trim() : "");
  if (!key) {
    console.log("\n✗ Clé ElevenLabs introuvable.");
    console.log("  Ajoute-la comme secret Codespaces nommé ELEVENLABS_API_KEY (recommandé),");
    console.log("  ou colle-la seule dans le fichier .voix/cle-elevenlabs.txt (jamais envoyé sur GitHub).\n");
    process.exit(1);
  }
  return key;
};

/** fetch avec un message clair si internet ou ElevenLabs ne répondent pas. */
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
      const labels = Object.values(v.labels ?? {}).filter(Boolean).join(", ");
      console.log(`  ${ok}  ${v.voice_id}   ${v.name}${labels ? `  (${labels})` : ""}`);
    });
  console.log("\nUtilise-en une avec : npm run voix -- --voix <identifiant>");
  console.log("Les voix ✓ parlent français avec le modèle multilingue, même si elles sont décrites en anglais.\n");
};

/** Voix par défaut : la première voix utilisable gratuitement du compte. */
export const defaultVoice = async () => {
  const voices = await fetchVoices();
  const v = voices.find((x) => x.category === "premade") ?? voices.find((x) => FREE_OK.includes(x.category));
  if (!v) {
    console.log("\n✗ Aucune voix utilisable avec le compte gratuit. Vois : npm run voix -- --lister\n");
    process.exit(1);
  }
  console.log(`  Aucune voix choisie : « ${v.name} » (${v.voice_id}). Pour en choisir une : npm run voix -- --lister`);
  return v.voice_id;
};

/**
 * Génère (ou relit depuis le cache) la voix du texte complet.
 * @returns {{ mp3: Buffer, heard: {text: string, start: number}[], duration: number }}
 */
export const synthesize = async ({ text, voice, model, settings, cacheDir, take }) => {
  mkdirSync(cacheDir, { recursive: true });
  const hash = createHash("sha1").update(JSON.stringify({ text, voice, model, settings, take })).digest("hex").slice(0, 10);
  const cacheFile = path.join(cacheDir, `elevenlabs-${hash}.json`);
  let data;
  if (existsSync(cacheFile)) {
    data = JSON.parse(readFileSync(cacheFile, "utf8"));
    console.log(`  Prise ${take} déjà générée : réutilisée (aucun crédit consommé).`);
  } else {
    console.log(`  Prise ${take} : envoi de ${text.length} caractères à ElevenLabs (≈ ${text.length} crédits)…`);
    const res = await call(`${API}/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": getKey(), "Content-Type": "application/json" },
      body: JSON.stringify({ text, model_id: model, voice_settings: settings, seed: 1000 + take }),
    });
    if (!res.ok) {
      console.log(`\n✗ ElevenLabs : ${await explain(res)}\n`);
      process.exit(1);
    }
    data = await res.json();
    writeFileSync(cacheFile, JSON.stringify(data));
  }

  // Regroupe les caractères horodatés en mots
  const a = data.alignment ?? data.normalized_alignment;
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
  const duration = Math.max(...a.character_end_times_seconds) + 0.4;
  return { mp3: Buffer.from(data.audio_base64, "base64"), heard, duration };
};
