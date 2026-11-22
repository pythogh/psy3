import React from "react";
import type { ShotText } from "../../data/types";
import { usePalette, useTheme } from "../../theme/ThemeContext";
import { mix, ramp } from "../layers/anim";

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
 */
export const KineticText: React.FC<{ item: ShotText; t: number; d: number }> = ({ item, t, d }) => {
  const theme = useTheme();
  const pal = usePalette();
  const style = theme.type[item.style ?? "title"];
  const { width, marginX, textTop, safeBottom, height } = theme.layout;
  const maxWidth = width - 2 * marginX;

  const lines = item.text.split(/\s*\|\s*|\n/).map((l) => l.split(" ").filter(Boolean));
  const words = lines.flat();
  const fontSize = fitFontSize(words, style.size, style.weight, theme.font.family, style.tracking, maxWidth);

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
        {lines.map((line, li) => (
          <div key={li} style={{ display: "flex", flexWrap: "wrap", columnGap: "0.24em" }}>
            {line.map((word, wi) => {
              const i = k++;
              const start = at + (words.length > 1 ? (spread * i) / (words.length - 1) : 0);
              const p = ramp(t, start, WORD_IN);
              return (
                <span key={wi} style={{ display: "inline-block", overflow: "hidden", padding: "0.1em 0 0.08em", margin: "-0.1em 0 -0.08em" }}>
                  <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, whiteSpace: "pre" }}>
                    {word}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
