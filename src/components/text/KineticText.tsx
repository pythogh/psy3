import React from "react";
import type { ShotText } from "../../data/types";
import { usePalette, useTheme } from "../../theme/ThemeContext";
import { mix, ramp, springy } from "../layers/anim";

const WORDS_PER_SECOND = 7; // débit de révélation par défaut (plus rapide que la voix)
const WORD_IN = 0.22; // durée d'apparition d'un mot (s)

let measureCtx: CanvasRenderingContext2D | null = null;
/** Réduit la taille si le mot le plus long dépasse la largeur disponible (mesure avec la vraie police). */
const fitFontSize = (words: string[], size: number, weight: number, family: string, tracking: number, maxWidth: number) => {
  if (typeof document === "undefined") return size;
  measureCtx = measureCtx ?? document.createElement("canvas").getContext("2d");
  if (!measureCtx) return size;
  measureCtx.font = `${weight} ${size}px ${family}`;
  const widest = Math.max(...words.map((w) => measureCtx!.measureText(w).width + tracking * size * (w.length - 1)));
  return widest > maxWidth ? Math.floor(size * (maxWidth / widest)) : size;
};

/**
 * Texte révélé mot par mot : chaque mot monte depuis un masque.
 * Une fois complet, le bloc continue de dériver lentement : il n'est jamais figé.
 * Style « term » : la notion est posée sur une étiquette crème légèrement penchée,
 * cerclée d'encre, avec la couche de couleur décalée dessous (comme un autocollant).
 */
export const KineticText: React.FC<{ item: ShotText; t: number; d: number }> = ({ item, t, d }) => {
  const theme = useTheme();
  const pal = usePalette();
  const styleName = item.style ?? "title";
  const style = theme.type[styleName];
  const isTerm = styleName === "term";
  const { width, marginX, textTop, safeBottom } = theme.layout;
  // L'étiquette prend de la place autour du texte : on réserve sa marge intérieure
  const maxWidth = width - 2 * marginX - (isTerm ? 120 : 0);

  const lines = item.text.split(/\s*\|\s*|\n/).map((l) => l.split(" ").filter(Boolean));
  const words = lines.flat();
  const bare = (w: string) => w.replace(/\*/g, "");
  // Sur le fond vert sauge, le rouge se lit mal : le mot clé est souligné en rouge à la place
  const onSage = pal.bg === theme.palettes.accent.bg && styleName !== "term";
  const fontSize = fitFontSize(words.map(bare), style.size, style.weight, theme.font.family, style.tracking, maxWidth);

  const at = item.at ?? 0.05;
  const spread = item.spread ?? Math.min(d * 0.6, words.length / WORDS_PER_SECOND);
  const drift = mix(0, -18, ramp(t, at, d, "linear"));

  const pos = item.pos ?? "bottom";
  const box: React.CSSProperties =
    pos === "top"
      ? { top: textTop }
      : pos === "bottom"
        ? { bottom: safeBottom }
        : { top: textTop, bottom: safeBottom, display: "flex", flexDirection: "column", justifyContent: "center" };

  // Étiquette : toujours crème et encre (comme un autocollant), quel que soit le fond
  const paper = theme.palettes.cream.bg;
  const ink = theme.palettes.cream.fg;
  const pop = isTerm ? Math.max(0, springy(t, Math.max(0, at - 0.05), 0.5)) : 1;
  const label: React.CSSProperties = isTerm
    ? {
        display: "inline-block",
        background: paper,
        color: ink,
        border: `6px solid ${ink}`,
        borderRadius: 18,
        padding: "0.12em 0.32em 0.16em",
        boxShadow: `${theme.shadow.dx * 1.6}px ${theme.shadow.dy * 1.6}px 0 ${pal.shadow}`,
        transform: `rotate(-2.5deg) scale(${pop})`,
        transformOrigin: "20% 60%",
      }
    : {};

  // Citation entre guillemets « … » : écrite en clair sur une bande d'encre continue, qui se déroule avec les mots
  const inQuote: boolean[] = [];
  {
    let q = false;
    for (const w of words) {
      if (w.includes("«")) q = true;
      inQuote.push(q);
      if (w.includes("»")) q = false;
    }
  }
  let k = 0;
  return (
    <div style={{ position: "absolute", left: marginX, right: marginX, ...box, height: pos === "center" ? undefined : "auto" }}>
      <div
        style={{
          transform: `translateY(${drift}px)`,
          fontFamily: theme.font.family,
          fontSize,
          fontWeight: style.weight,
          lineHeight: style.lineHeight,
          letterSpacing: `${style.tracking}em`,
          color: pal[item.color ?? "fg"],
        }}
      >
        <div style={label}>
          {lines.map((line, li) => (
            <div key={li} style={{ display: "flex", flexWrap: "wrap", columnGap: "0.24em" }}>
              {line.map((word, wi) => {
                const i = k++;
                const start = at + (words.length > 1 ? (spread * i) / (words.length - 1) : 0);
                const p = ramp(t, start, WORD_IN);
                const quoted = inQuote[i];
                const quoteStart = quoted && (i === 0 || !inQuote[i - 1] || wi === 0);
                const quoteEnd = quoted && (i === words.length - 1 || !inQuote[i + 1] || wi === line.length - 1);
                const band: React.CSSProperties = quoted
                  ? {
                      // La bande couvre aussi l'espace entre les mots : pas de trou dans la citation
                      backgroundImage: `linear-gradient(${pal.fg}, ${pal.fg})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${ramp(t, start, WORD_IN + 0.05) * 100}% 100%`,
                      paddingLeft: quoteStart ? "0.16em" : 0,
                      paddingRight: quoteEnd ? "0.16em" : "0.24em",
                      marginRight: quoteEnd ? 0 : "-0.24em",
                      borderRadius: `${quoteStart ? "0.1em" : 0} ${quoteEnd ? "0.1em" : 0} ${quoteEnd ? "0.1em" : 0} ${quoteStart ? "0.1em" : 0}`,
                    }
                  : {};
                return (
                  <span key={wi} style={{ display: "inline-block", overflow: "hidden", padding: "0.1em 0 0.08em", margin: "-0.1em 0 -0.08em", ...band }}>
                    <span
                      style={{
                        display: "inline-block",
                        position: "relative",
                        transform: `translateY(${(1 - p) * 110}%)`,
                        whiteSpace: "pre",
                        // Mot clé entre astérisques : en rouge, ou souligné en rouge (trait qui se dessine) sur le fond vert
                        color: quoted ? pal.bg : /\*/.test(word) && !onSage ? pal.accent : undefined,
                      }}
                    >
                      {bare(word)}
                      {/\*/.test(word) && onSage ? (
                        <span
                          style={{
                            position: "absolute",
                            left: "-0.02em",
                            right: "-0.02em",
                            bottom: "0.04em",
                            height: "0.085em",
                            borderRadius: "0.05em",
                            background: pal.accent,
                            transform: `scaleX(${ramp(t, start + WORD_IN * 0.8, 0.4)}) rotate(-0.6deg)`,
                            transformOrigin: "left center",
                          }}
                        />
                      ) : null}
                    </span>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
