// Transcription locale avec Whisper (via Remotion) : renvoie chaque mot entendu et sa seconde.
import { existsSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { downloadWhisperModel, installWhisperCpp, toCaptions, transcribe } from "@remotion/install-whisper-cpp";

const WHISPER_DIR = path.resolve(".voix/whisper.cpp");
const WHISPER_VERSION = "1.5.5";

export const ensureWhisper = async (model = "small") => {
  await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION, printOutput: false });
  // Un téléchargement interrompu laisse un fichier incomplet : on le supprime pour réessayer
  const modelFile = path.join(WHISPER_DIR, `ggml-${model}.bin`);
  if (existsSync(modelFile) && statSync(modelFile).size < 50_000_000) rmSync(modelFile);
  if (!existsSync(modelFile)) console.log(`→ Téléchargement du modèle Whisper « ${model} » (une seule fois)…`);
  await downloadWhisperModel({ model, folder: WHISPER_DIR, printOutput: false });
};

/** @returns {{ heard: {text: string, start: number}[], duration: number }} */
export const transcribeWords = async (audioPath, model = "small") => {
  const wav16 = path.resolve(".voix/whisper-16k.wav");
  const conv = spawnSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", audioPath, "-ar", "16000", "-ac", "1", wav16], { stdio: "inherit" });
  if (conv.status !== 0) throw new Error("Conversion audio impossible.");
  const duration = (statSync(wav16).size - 44) / (16000 * 2);
  const output = await transcribe({
    inputPath: wav16,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: WHISPER_VERSION,
    model,
    tokenLevelTimestamps: true,
    language: "fr",
    printOutput: false,
  });
  const { captions } = toCaptions({ whisperCppOutput: output });
  return { heard: captions.map((c) => ({ text: c.text, start: c.startMs / 1000 })), duration };
};
