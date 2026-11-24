import { zColor } from "@remotion/zod-types";
import { z } from "zod";

/*
 * Description de tous les réglages d'une vidéo.
 * Le Studio Remotion lit ce schéma pour générer le panneau de réglages (onglet « Props »).
 * Les types TypeScript du projet en sont déduits : une seule source de vérité.
 */

const seconds = (max = 10) => z.number().min(0).max(max);
const px = z.number().min(-2000).max(3000);
const range = (min: number, max: number, _step?: number) => z.tuple([z.number().min(min).max(max), z.number().min(min).max(max)]);

const background = z.enum(["cream", "ink", "accent"]).describe("Fond du plan : crème, noir ou orange");
const paletteColor = z.enum(["fg", "accent", "muted", "bg", "shadow", "screen"]);
const mascotMood = z
  .enum(["content", "perplexe", "surpris", "reveur", "gene"])
  .describe("Humeur de la mascotte : contente, perplexe, surprise, rêveuse, gênée");

/* ── Texte ───────────────────────────────────────────────────────── */

export const shotTextSchema = z.object({
  text: z.string().describe("Texte affiché, révélé mot par mot. Le signe | force un retour à la ligne"),
  style: z.enum(["giant", "hook", "title", "body", "note"]).optional().describe("Taille : géant, accroche, titre, corps, note"),
  pos: z.enum(["top", "center", "bottom"]).optional().describe("Position verticale"),
  at: seconds().optional().describe("Début de la révélation (s)"),
  spread: seconds().optional().describe("Durée de la révélation de tous les mots (s)"),
  color: paletteColor.optional().describe("Couleur (fg = couleur principale du fond)"),
});

/* ── Caméra et transition ────────────────────────────────────────── */

export const cameraSchema = z.object({
  zoom: range(0.3, 3, 0.01).optional().describe("Zoom au début et à la fin du plan"),
  x: range(-1000, 1000, 5).optional().describe("Déplacement horizontal (px), début et fin"),
  y: range(-1000, 1000, 5).optional().describe("Déplacement vertical (px), début et fin"),
  rotate: range(-45, 45, 0.5).optional().describe("Rotation (degrés), début et fin"),
  punch: z.array(seconds()).optional().describe("Instants (s) des coups de zoom"),
});

export const transitionSchema = z.object({
  type: z.enum(["cut", "slam", "fade", "rise", "slide", "zoom", "wipe"]),
  duration: seconds(2).optional(),
});

/* ── Calques visuels ─────────────────────────────────────────────── */

const phoneLayer = z.object({
  type: z.literal("phone"),
  x: px,
  y: px,
  scale: z.number().min(0.05).max(4),
  screen: z.enum(["off", "on", "unlock", "flash"]).optional().describe("Écran"),
  notifyAt: seconds().optional().describe("Apparition de la notification (s)"),
  motion: z.enum(["float", "drop", "pop", "shake", "none"]).optional().describe("Mouvement"),
  rotate: z.number().min(-180).max(180).optional(),
});

const phoneRowLayer = z.object({
  type: z.literal("phoneRow"),
  count: z.number().int().min(1).max(8),
  y: px,
  scale: z.number().min(0.05).max(2),
  interval: seconds(3).describe("Intervalle de départ entre deux déverrouillages (s)"),
});

const phoneGridLayer = z.object({
  type: z.literal("phoneGrid"),
  columns: z.number().int().min(1).max(8),
  rows: z.number().int().min(1).max(8),
  y: px,
  scale: z.number().min(0.05).max(2),
  gap: z.number().min(0).max(300),
  checks: z
    .array(z.object({ cell: z.number().int().min(0).max(63), at: seconds(), reward: z.boolean().optional() }))
    .describe("Vérifications : case, instant (s), récompense ou non"),
});

const patternLayer = z.object({
  type: z.literal("pattern"),
  columns: z.number().int().min(1).max(12),
  rows: z.number().int().min(1).max(12),
  y: px,
  size: z.number().min(10).max(400),
  gap: z.number().min(0).max(200),
  mode: z.enum(["sequence", "irregular"]).describe("Remplissage régulier ou flashs imprévisibles"),
  rewardRate: z.number().min(0).max(1).optional().describe("Proportion de récompenses (mode irregular)"),
  seed: z.string().describe("Graine : changer le mot change le placement"),
});

const counterLayer = z.object({
  type: z.literal("counter"),
  from: z.number(),
  to: z.number(),
  suffix: z.string().optional(),
  x: px,
  y: px,
  radius: z.number().min(20).max(800),
  duration: seconds().describe("Durée du décompte (s)"),
});

const dotLayer = z.object({
  type: z.literal("dot"),
  x: px,
  y: px,
  radius: z.number().min(5).max(800),
  mode: z.enum(["fill", "empty", "fillToEmpty"]),
  emptyAt: seconds().optional().describe("Instant où le point se vide (s)"),
  echo: z.boolean().optional().describe("Onde d'écho"),
});

const shapeLayer = z.object({
  type: z.literal("shape"),
  shape: z.enum(["circle", "ring", "dashedRing", "square"]),
  x: px,
  y: px,
  size: z.number().min(10).max(3000),
  color: paletteColor.optional(),
  spin: z.number().min(-360).max(360).optional().describe("Rotation continue (degrés/s)"),
});

const groundLayer = z.object({
  type: z.literal("ground"),
  y: px.describe("Hauteur de la ligne de sol (px)"),
  context: z
    .object({ kind: z.enum(["elevator", "queue", "hourglass"]), x: px, at: seconds().optional() })
    .optional()
    .describe("Décor qui surgit du sol"),
  phone: z
    .object({
      x: px,
      scale: z.number().min(0.05).max(2),
      pops: z.array(z.object({ at: seconds(), hold: seconds() })).describe("Surgissements : instant et durée (s)"),
    })
    .optional(),
});

const timelineLayer = z.object({
  type: z.literal("timeline"),
  y: px,
  startLabel: z.string(),
  endLabel: z.string(),
  count: z.number().int().min(0).max(300).describe("Nombre de micro-vérifications"),
  longSessions: z.array(z.object({ at: z.number().min(0).max(1), length: z.number().min(0).max(1) })),
  seed: z.string(),
  sweep: range(0, 1, 0.01).describe("Position du curseur au début et à la fin du plan (0 à 1)"),
});

const reachLayer = z.object({
  type: z.literal("reach"),
  x: px,
  y: px,
  scale: z.number().min(0.05).max(2),
  at: seconds().describe("Instant où le bras atteint le téléphone (s)"),
});

const mascotLayer = z.object({
  type: z.literal("mascot"),
  x: px.describe("Centre du corps (px)"),
  y: px.describe("Centre du corps (px)"),
  scale: z.number().min(0.1).max(6).describe("Échelle (diamètre du corps ≈ 128 × échelle)"),
  mood: mascotMood,
  onDark: z.boolean().optional().describe("Tige et feuille claires pour un fond sombre"),
  enterAt: seconds().optional().describe("Instant d'entrée en rebond (s)"),
});

export const layerSchema = z.discriminatedUnion("type", [
  phoneLayer,
  phoneRowLayer,
  phoneGridLayer,
  patternLayer,
  counterLayer,
  dotLayer,
  shapeLayer,
  groundLayer,
  timelineLayer,
  reachLayer,
  mascotLayer,
]);

/* ── Plan ────────────────────────────────────────────────────────── */

export const shotSchema = z.object({
  id: z.string().describe("Nom du plan (unique)"),
  chapter: z.string().optional(),
  duration: z.number().min(0.2).max(20).describe("Durée (s)"),
  startAt: z.number().min(0).max(600).optional().describe("Début dans la voix off (s), prioritaire sur les durées"),
  narration: z.string().describe("Texte de la voix off sur ce plan"),
  bg: background,
  enter: transitionSchema.optional().describe("Transition d'entrée"),
  camera: cameraSchema.optional(),
  shadow: z.boolean().optional().describe("Ombres portées (défaut : oui)"),
  layers: z.array(layerSchema).describe("Calques visuels, du fond vers l'avant"),
  text: shotTextSchema.optional(),
});

/* ── Style global ────────────────────────────────────────────────── */

const paletteSchema = z.object({
  bg: zColor(),
  fg: zColor(),
  accent: zColor(),
  muted: zColor(),
  shadow: zColor(),
  screen: zColor(),
});

export const styleSchema = z.object({
  palettes: z.object({ cream: paletteSchema, ink: paletteSchema, accent: paletteSchema }).describe("Couleurs de chaque type de fond"),
  textSizes: z
    .object({
      giant: z.number().min(40).max(400),
      hook: z.number().min(30).max(300),
      title: z.number().min(24).max(200),
      body: z.number().min(20).max(160),
      note: z.number().min(16).max(100),
    })
    .describe("Taille de chaque style de texte (px)"),
  shadow: z.object({
    dx: z.number().min(-60).max(60),
    dy: z.number().min(-60).max(60),
  }).describe("Décalage de l'ombre portée (px). 0 / 0 = sans ombre"),
  grain: z.number().min(0).max(1).describe("Intensité du grain papier"),
  progressBar: z.boolean().describe("Barre de progression en haut"),
  series: z.string().describe("Titre de série (vide = masqué)"),
});

/* ── Recettes de plans (format court) ───────────────────────────── */

const recipeCommon = {
  text: z.string().describe("Texte affiché, révélé mot par mot. Le signe | force un retour à la ligne"),
  duration: z.number().min(0.2).max(20).describe("Durée (s)"),
  bg: background.optional(),
  narration: z.string().optional().describe("Voix off sur ce plan (repère)"),
  textStyle: z.enum(["giant", "hook", "title", "body"]).optional().describe("Taille du texte (auto si vide)"),
  textPos: z.enum(["top", "center", "bottom"]).optional().describe("Position du texte (auto si vide)"),
  enter: z.enum(["cut", "slam", "fade", "rise", "slide", "zoom", "wipe"]).optional().describe("Transition d'entrée (défaut : cut)"),
  camera: z.enum(["push", "pull", "still", "drift", "punch"]).optional().describe("Mouvement de caméra"),
  decor: z.enum(["none", "circle", "ring", "dashedRing", "square"]).optional().describe("Grande forme coupée par le cadre"),
  shadow: z.boolean().optional().describe("Ombres portées sur ce plan (défaut : oui). false = sans ombre"),
  startAt: z.number().min(0).max(600).optional().describe("Début dans la voix off (s)"),
};

export const recipeShotSchema = z.discriminatedUnion("recipe", [
  z.object({
    recipe: z.literal("phone"),
    ...recipeCommon,
    screen: z.enum(["off", "on", "unlock", "flash"]).optional(),
    motion: z.enum(["float", "drop", "pop", "shake", "none"]).optional(),
    notify: z.boolean().optional().describe("Pastille de notification"),
  }),
  z.object({ recipe: z.literal("phoneRow"), ...recipeCommon, count: z.number().int().min(2).max(5).optional() }),
  z.object({
    recipe: z.literal("phoneGrid"),
    ...recipeCommon,
    pace: z.enum(["slow", "fast"]).optional().describe("Rythme des vérifications"),
    rewards: z.number().int().min(0).max(4).optional().describe("Nombre de notifications"),
  }),
  z.object({
    recipe: z.literal("counter"),
    ...recipeCommon,
    from: z.number().optional(),
    to: z.number(),
    suffix: z.string().optional(),
  }),
  z.object({ recipe: z.literal("words"), ...recipeCommon }),
  z.object({
    recipe: z.literal("pattern"),
    ...recipeCommon,
    mode: z.enum(["sequence", "irregular"]).optional(),
    rewards: z.number().min(0).max(1).optional().describe("Proportion de cases orange (mode irregular)"),
    close: z.boolean().optional().describe("Cadrage serré"),
    seed: z.string().optional().describe("Même graine = même grille (pour enchaîner deux plans)"),
  }),
  z.object({ recipe: z.literal("dot"), ...recipeCommon, mode: z.enum(["fill", "empty", "fillToEmpty"]).optional() }),
  z.object({ recipe: z.literal("ground"), ...recipeCommon, pace: z.enum(["slow", "fast"]).optional() }),
  z.object({ recipe: z.literal("context"), ...recipeCommon, kind: z.enum(["elevator", "queue", "hourglass"]) }),
  z.object({ recipe: z.literal("reach"), ...recipeCommon }),
  z.object({ recipe: z.literal("timeline"), ...recipeCommon, part: z.enum(["start", "end", "all"]).optional() }),
  z.object({
    recipe: z.literal("mascot"),
    ...recipeCommon,
    mood: mascotMood.optional(),
    size: z.enum(["small", "medium", "large"]).optional().describe("Taille de la mascotte"),
    position: z.enum(["center", "bottom", "corner"]).optional().describe("Place : centre, en bas (texte en haut), dans un coin"),
  }),
  z.object({
    recipe: z.literal("custom"),
    ...recipeCommon,
    layers: z.array(layerSchema).describe("Calques détaillés (mode expert)"),
    cameraDetail: cameraSchema.optional(),
  }),
]);

/* ── Vidéo ───────────────────────────────────────────────────────── */

export const voixSchema = z
  .object({
    id: z.string().optional().describe("Identifiant de la voix ElevenLabs"),
    nom: z.string().optional().describe("Nom de la voix (pour s'y retrouver)"),
    stabilite: z.number().min(0).max(1).optional().describe("Plus bas = plus vivant, plus haut = plus régulier (défaut 0.45)"),
    style: z.number().min(0).max(1).optional().describe("Accentuation du style de la voix (défaut 0.2)"),
    vitesse: z.number().min(0.7).max(1.2).optional().describe("Débit (défaut 1.0)"),
    modele: z.string().optional().describe("Modèle ElevenLabs (défaut eleven_multilingual_v2)"),
  })
  .describe("Réglages de la voix off, enregistrés par npm run voix");

export const videoSchema = z.object({
  title: z.string(),
  script: z
    .array(z.string())
    .optional()
    .describe("Texte DIT par la voix off, un paragraphe par ligne. Indépendant du texte affiché des plans"),
  voix: voixSchema.optional(),
  planche: z.boolean().optional().describe("Afficher la planche contact (une image par plan) au lieu de la vidéo"),
  style: styleSchema,
  audio: z
    .object({
      src: z.string().describe("Fichier dans public/, ex. voix/sujet.mp3"),
      volume: z.number().min(0).max(1).optional(),
      offset: seconds(60).optional().describe("Décalage de l'audio (s)"),
    })
    .optional()
    .describe("Voix off"),
  shots: z.array(recipeShotSchema).describe("Les plans, dans l'ordre"),
});

export type VideoProps = z.infer<typeof videoSchema>;
export type VideoStyle = z.infer<typeof styleSchema>;
export type RecipeShot = z.infer<typeof recipeShotSchema>;
