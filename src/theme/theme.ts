/**
 * Jetons de design. Tout ce qui touche à l'apparence vit ici.
 * Une vidéo peut surcharger n'importe quelle valeur via `theme` dans son fichier de données.
 */

/** Une palette par type de fond. Chaque plan choisit son fond : cream, ink ou accent. */
export type Palette = {
  bg: string; // fond
  fg: string; // texte et objets principaux
  accent: string; // accent (écran allumé, récompenses)
  muted: string; // éléments secondaires
  shadow: string; // ombre portée dure (en risographie : la couche de couleur décalée)
  screen: string; // écran éteint
};

export const baseTheme = {
  palettes: {
    cream: { bg: "#EDE5D3", fg: "#141210", accent: "#B5470F", muted: "#A39A8A", shadow: "#B5470F", screen: "#2A2622" },
    ink: { bg: "#141210", fg: "#EDE5D3", accent: "#D0561A", muted: "#5E5850", shadow: "#B5470F", screen: "#2A2622" },
    accent: { bg: "#B5470F", fg: "#141210", accent: "#EDE5D3", muted: "#8C360B", shadow: "#141210", screen: "#2A2622" },
  } as Record<"cream" | "ink" | "accent", Palette>,
  font: {
    family: '"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif',
  },
  // Échelle typographique (px, canvas 1080 × 1920). La taille se réduit seule si un mot ne tient pas.
  type: {
    giant: { size: 230, weight: 800, lineHeight: 0.9, tracking: -0.045 },
    hook: { size: 118, weight: 800, lineHeight: 0.98, tracking: -0.035 },
    title: { size: 88, weight: 700, lineHeight: 1.02, tracking: -0.03 },
    body: { size: 60, weight: 600, lineHeight: 1.12, tracking: -0.015 },
    note: { size: 34, weight: 500, lineHeight: 1.3, tracking: 0 },
  },
  layout: {
    width: 1080,
    height: 1920,
    marginX: 96,
    safeTop: 150, // zone libre pour l'interface TikTok en haut
    safeBottom: 420, // et en bas
    textTop: 250, // haut du texte en position "top"
  },
  shadow: { dx: 16, dy: 16 }, // ombre portée dure (sans flou)
  grain: { opacity: 0.16 }, // texture papier (public/grain.png), 0 pour la désactiver
  // Risographie : désactivée par défaut, les anciennes vidéos ne changent pas
  riso: { wobble: 0, boil: false, speckle: false },
  motion: {
    enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
    exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
    inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  },
};

export type Theme = typeof baseTheme;
export type Background = keyof Theme["palettes"];
export type TextStyleName = keyof Theme["type"];
export type PaletteColor = keyof Palette;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type ThemeOverride = DeepPartial<Theme>;

/** Construit le thème complet à partir du style réglable dans le Studio. */
export const styleToTheme = (style: {
  palettes: Theme["palettes"];
  textSizes: Record<TextStyleName, number>;
  shadow: { dx: number; dy: number };
  grain: number;
  riso?: { wobble: number; boil: boolean; speckle: boolean };
}): Theme => {
  const t: Theme = JSON.parse(JSON.stringify(baseTheme));
  t.palettes = style.palettes;
  (Object.keys(t.type) as TextStyleName[]).forEach((k) => {
    if (style.textSizes[k]) t.type[k].size = style.textSizes[k];
  });
  t.shadow = style.shadow;
  t.grain = { opacity: style.grain };
  if (style.riso) t.riso = style.riso;
  return t;
};

export const mergeTheme = (override?: ThemeOverride): Theme => {
  if (!override) return baseTheme;
  const out: any = JSON.parse(JSON.stringify(baseTheme));
  const merge = (target: any, src: any) => {
    for (const k of Object.keys(src)) {
      const v = src[k];
      if (v && typeof v === "object" && !Array.isArray(v)) merge(target[k], v);
      else target[k] = v;
    }
  };
  merge(out, override);
  return out;
};
