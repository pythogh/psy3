# Synthèse vocale locale et gratuite, appelée par `npm run voix`.
# Reçoit des PHRASES entières (pas des morceaux de plan) pour une intonation naturelle.
# Chaque prise est gardée en cache : changer de prise ne régénère rien.
import hashlib, json, os, sys
import numpy as np
import soundfile as sf

job = json.load(open(sys.argv[1], encoding="utf-8"))
engine = job["engine"]
os.makedirs(job["takesDir"], exist_ok=True)


def take_path(i, text, take):
    # Le nom dépend du texte et des réglages : une phrase modifiée est régénérée, les autres non
    key = json.dumps([text, engine, job["settings"], job.get("reference")], sort_keys=True, ensure_ascii=False)
    h = hashlib.sha1(key.encode("utf-8")).hexdigest()[:8]
    return os.path.join(job["takesDir"], f"phrase-{i + 1:02d}-{h}-prise-{take}.wav")


def trim(audio, sr):
    # Retire les silences de début et de fin produits par le modèle
    if len(audio) == 0:
        return audio
    threshold = max(0.01, float(np.max(np.abs(audio))) * 0.03)
    nz = np.where(np.abs(audio) > threshold)[0]
    if len(nz) == 0:
        return audio
    return audio[max(0, nz[0] - int(0.04 * sr)) : nz[-1] + int(0.08 * sr)]


# ── Chargement du moteur (seulement si une prise manque) ──────────────────────
model = None


def load_engine():
    global model
    if model is not None:
        return
    if engine == "chatterbox":
        import torch
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS

        torch.set_num_threads(max(1, os.cpu_count() or 1))
        print("  Chargement de Chatterbox (lent la première fois)…", flush=True)
        model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
    else:
        from kokoro_onnx import Kokoro

        model = Kokoro(job["kokoro"]["model"], job["kokoro"]["voices"])


def synthesize(text, take):
    s = job["settings"]
    if engine == "chatterbox":
        import torch

        torch.manual_seed(1000 * take + 7)  # prises différentes mais reproductibles
        wav = model.generate(
            text,
            language_id="fr",
            audio_prompt_path=job.get("reference"),
            exaggeration=s["exaggeration"],
            cfg_weight=s["cfg"],
            temperature=s["temperature"],
        )
        return wav.squeeze(0).numpy().astype(np.float32), model.sr
    audio, sr = model.create(text, voice=s["voice"], speed=s["speed"], lang="fr-fr")
    return np.asarray(audio, dtype=np.float32), sr


# ── Génération des prises manquantes ──────────────────────────────────────────
phrases = job["phrases"]
for i, text in enumerate(phrases):
    for take in range(1, job["takes"] + 1):
        p = take_path(i, text, take)
        if os.path.exists(p):
            continue
        load_engine()
        print(f"  phrase {i + 1:2d}/{len(phrases)}  prise {take}  {text[:58]}", flush=True)
        audio, sr = synthesize(text, take)
        sf.write(p, trim(audio, sr), sr, subtype="PCM_16")

# ── Assemblage avec les prises choisies ───────────────────────────────────────
pauses = job["pauses"]
parts, starts, durations, files = [], [], [], []
sr_out = None
cursor = pauses["debut"]
for i, text in enumerate(phrases):
    take = min(max(1, int(job["choices"].get(str(i + 1), 1))), job["takes"])
    path = take_path(i, text, take)
    audio, sr = sf.read(path, dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    if sr_out is None:
        sr_out = sr
        parts.append(np.zeros(int(sr * pauses["debut"]), dtype=np.float32))
    starts.append(cursor)
    durations.append(len(audio) / sr)
    files.append(os.path.basename(path))
    parts.append(audio)
    cursor += len(audio) / sr
    last = i == len(phrases) - 1
    gap = pauses["fin"] if last else (pauses["deuxPoints"] if text.rstrip().endswith(":") else pauses["phrase"])
    parts.append(np.zeros(int(sr * gap), dtype=np.float32))
    cursor += gap

full = np.concatenate(parts)
peak = float(np.max(np.abs(full))) or 1.0
full = full / peak * 0.89  # volume homogène, sans saturation
sf.write(job["output"], full, sr_out, subtype="PCM_16")
json.dump({"starts": starts, "durations": durations, "files": files, "duration": len(full) / sr_out}, open(job["result"], "w"))
