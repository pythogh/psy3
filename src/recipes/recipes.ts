import { random } from "remotion";
import type { Camera, Layer, RecipeShot, Shot, ShotText } from "../data/types";

/*
 * RECETTES DE PLANS
 * Chaque recette transforme une ligne courte (recette + texte + durée + quelques options)
 * en plan complet : calques positionnés, caméra, style de texte.
 * Toutes les positions sont calculées ici : on n'a plus à les écrire dans la vidéo.
 * Pour une nouvelle recette : ajoute-la dans data/schema.ts (recipeShotSchema), puis un cas ci-dessous.
 */

const CAMERAS: Record<NonNullable<RecipeShot["camera"]>, (d: number) => Camera> = {
  push: () => ({ zoom: [1, 1.08] }),
  pull: () => ({ zoom: [1.15, 1] }),
  still: () => ({ zoom: [1, 1.015] }),
  drift: () => ({ zoom: [1.05, 1.1], x: [-30, 30] }),
  punch: (d) => ({ zoom: [1, 1.06], punch: [Math.min(0.35, d * 0.3)] }),
};

/** Grandes formes de décor : placement varié selon le numéro du plan (déterministe). */
const DECOR_SPOTS = [
  { x: 980, y: 420, size: 520 },
  { x: 130, y: 1500, size: 760 },
  { x: 900, y: 1450, size: 900 },
  { x: 1000, y: 1200, size: 640 },
];

/** Échelle de la mascotte (diamètre du corps ≈ 128 × scale px). */
const MASCOT_SCALE = { small: 1.1, medium: 2.1, large: 3.2 } as const;

const decorLayer = (decor: RecipeShot["decor"], bg: Shot["bg"], index: number): Layer[] => {
  if (!decor || decor === "none") return [];
  if (decor === "ring" || decor === "dashedRing") {
    return [{ type: "shape", shape: decor, x: 820, y: 560, size: 900, color: "fg", spin: decor === "dashedRing" ? 12 : 0 }];
  }
  const spot = DECOR_SPOTS[index % DECOR_SPOTS.length];
  return [{ type: "shape", shape: decor, ...spot, color: bg === "accent" ? "muted" : "accent" }];
};

const wordCount = (text: string) => text.replace(/\|/g, " ").split(/\s+/).filter(Boolean).length;

/** Vérifications de la grille de téléphones, générées à partir du rythme et de la durée. */
const gridChecks = (d: number, pace: "slow" | "fast", rewards: number, seed: string) => {
  const checks: { cell: number; at: number; reward?: boolean }[] = [];
  let at = 0.15;
  let step = pace === "slow" ? Math.max(0.3, d / 7) : 0.22;
  let k = 0;
  while (at < d - 0.25) {
    const cell = Math.floor(random(`${seed}-c-${k}`) * 8);
    checks.push({ cell, at: Math.round(at * 100) / 100 });
    at += step;
    if (pace === "fast") step = Math.max(0.08, step * 0.9);
    k++;
  }
  // Récompenses réparties dans la seconde moitié
  for (let r = 0; r < rewards && checks.length > 0; r++) {
    const idx = Math.min(checks.length - 1, Math.floor(checks.length * (0.35 + (0.5 * r) / Math.max(1, rewards))));
    checks[idx].reward = true;
  }
  return checks;
};

export const expandShot = (s: RecipeShot, index: number): Shot => {
  const d = s.duration;
  const bg = s.bg ?? "cream";
  const seed = `p${index}`;
  const isWords = s.recipe === "words";
  // Mascotte en bas : le texte monte en haut par défaut
  const mascotLow = s.recipe === "mascot" && s.position === "bottom";
  const textPos = s.textPos ?? (isWords ? "center" : mascotLow ? "top" : "bottom");
  // Zone libre pour le visuel selon la position du texte
  const vy = textPos === "top" ? 1150 : 640;
  const textStyle = s.textStyle ?? (isWords ? "giant" : wordCount(s.text) > 7 ? "title" : "hook");

  let layers: Layer[] = [];
  let camera: Camera = CAMERAS[s.camera ?? (isWords ? "pull" : "push")](d);

  switch (s.recipe) {
    case "phone":
      layers = [
        {
          type: "phone",
          x: 540,
          y: textPos === "top" ? 1180 : 690,
          scale: textPos === "top" ? 0.78 : 0.92,
          screen: s.screen ?? "on",
          motion: s.motion ?? "float",
          notifyAt: s.notify ? 0.35 : undefined,
        },
      ];
      break;
    case "phoneRow": {
      const count = s.count ?? 3;
      layers = [{ type: "phoneRow", count, y: vy + 60, scale: count <= 3 ? 0.72 : 0.5, interval: 0.32 }];
      break;
    }
    case "phoneGrid":
      layers = [
        {
          type: "phoneGrid",
          columns: 4,
          rows: 2,
          y: vy,
          scale: 0.4,
          gap: 60,
          checks: gridChecks(d, s.pace ?? "slow", s.rewards ?? 1, seed),
        },
      ];
      break;
    case "counter":
      layers = [
        { type: "counter", from: s.from ?? 0, to: s.to, suffix: s.suffix, x: 540, y: vy + 40, radius: 260, duration: Math.min(1.3, d * 0.6) },
      ];
      break;
    case "words":
      break;
    case "pattern": {
      const sequence = s.mode === "sequence";
      layers = [
        sequence
          ? { type: "pattern", columns: 5, rows: 4, y: vy, size: 120, gap: 24, mode: "sequence", seed: s.seed ?? seed }
          : {
              type: "pattern",
              columns: 6,
              rows: 6,
              y: vy + 40,
              size: 96,
              gap: 22,
              mode: "irregular",
              rewardRate: s.rewards ?? 0.12,
              seed: s.seed ?? seed,
            },
      ];
      if (s.close) camera = { zoom: [1.35, 1.45], x: [-80, -140] };
      break;
    }
    case "dot":
      layers = [{ type: "dot", x: 540, y: vy, radius: 190, mode: s.mode ?? "fill", emptyAt: 0.3, echo: (s.mode ?? "fill") !== "fill" }];
      break;
    case "ground": {
      const gap = s.pace === "fast" ? 0.45 : 0.6;
      const pops = [];
      for (let at = 0.15; at < d - 0.2; at += gap) pops.push({ at: Math.round(at * 100) / 100, hold: 0.22 });
      layers = [{ type: "ground", y: 960, phone: { x: 540, scale: 0.55, pops } }];
      break;
    }
    case "context":
      layers = [{ type: "ground", y: 960, context: { kind: s.kind, x: 330 }, phone: { x: 800, scale: 0.5, pops: [{ at: 0.3, hold: 60 }] } }];
      break;
    case "reach":
      layers = [{ type: "reach", x: 540, y: vy - 20, scale: 0.85, at: 0.4 }];
      if (!s.camera) camera = CAMERAS.punch(1.2);
      break;
    case "timeline": {
      const part = s.part ?? "all";
      layers = [
        {
          type: "timeline",
          y: 760,
          startLabel: "7 h",
          endLabel: "23 h",
          count: 62,
          seed: "journee",
          sweep: part === "start" ? [0, 0.4] : part === "end" ? [0.4, 1] : [0, 1],
          longSessions: [
            { at: 0.18, length: 0.035 },
            { at: 0.52, length: 0.05 },
            { at: 0.84, length: 0.04 },
          ],
        },
      ];
      if (part === "end" && !s.camera) camera = { zoom: [1.5, 1.25], x: [380, -120] };
      break;
    }
    case "mascot": {
      const position = s.position ?? "center";
      const size = s.size ?? (position === "corner" ? "small" : "medium");
      let x = 540;
      let y = vy + 40;
      if (position === "bottom") y = 1480;
      if (position === "corner") {
        x = 860;
        y = textPos === "bottom" ? 400 : 1560;
      }
      layers = [{ type: "mascot", x, y, scale: MASCOT_SCALE[size], mood: s.mood ?? "content", onDark: bg === "ink", enterAt: 0.1 }];
      if (!s.camera) camera = CAMERAS.still(d);
      break;
    }
    case "custom":
      layers = s.layers;
      if (s.cameraDetail) camera = s.cameraDetail;
      break;
  }

  // Décor : pour « words », un cercle par défaut pour ne jamais laisser un fond vide
  const decor = s.decor ?? (isWords ? "circle" : "none");
  layers = [...decorLayer(decor, bg, index), ...layers];

  const text: ShotText = { text: s.text, style: textStyle, pos: textPos };
  return {
    id: `${index + 1}-${s.recipe}`,
    duration: d,
    startAt: s.startAt,
    narration: s.narration ?? s.text,
    bg,
    enter: s.enter && s.enter !== "cut" ? { type: s.enter, duration: s.enter === "slam" ? 0.35 : 0.4 } : undefined,
    camera,
    shadow: s.shadow,
    layers,
    text,
  };
};

export const expandShots = (shots: RecipeShot[]): Shot[] => shots.map(expandShot);
