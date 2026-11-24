import React from "react";
import { interpolateColors } from "remotion";
import { usePalette } from "../../theme/ThemeContext";
import { isDark, useRiso } from "../riso";

export const PHONE_W = 300;
export const PHONE_H = 600;

/** Téléphone en risographie : trait d'encre, couche de couleur décalée, écran qui s'éclaire. */
const RisoPhone: React.FC<{ screen: number; notify: number }> = ({ screen, notify }) => {
  const pal = usePalette();
  const w = PHONE_W;
  const h = PHONE_H;
  const line = 10;
  const dark = isDark(pal.bg);
  const lit = dark ? pal.fg : pal.bg; // écran allumé : couleur papier
  const icons = dark ? pal.bg : pal.fg;
  const size = 46;
  const gap = 18;
  const gx = -(3 * size + 2 * gap) / 2;
  const gy = -h / 2 + 100;
  return (
    <g>
      {/* Couche de couleur décalée */}
      <rect x={-w / 2 + 20} y={-h / 2 + 18} width={w} height={h} rx={52} fill={pal.shadow} opacity={0.92} />
      {/* Écran qui s'éclaire */}
      <rect x={-w / 2 + 30} y={-h / 2 + 70} width={w - 60} height={h - 140} rx={14} fill={lit} opacity={screen * 0.9} />
      {/* Trait d'encre */}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={52} fill="none" stroke={pal.fg} strokeWidth={line} strokeLinejoin="round" />
      <rect x={-w / 2 + 30} y={-h / 2 + 70} width={w - 60} height={h - 140} rx={14} fill="none" stroke={pal.fg} strokeWidth={line * 0.6} />
      <path d={`M -26,${-h / 2 + 38} L 26,${-h / 2 + 38}`} stroke={pal.fg} strokeWidth={line * 0.7} strokeLinecap="round" />
      <path d={`M -40,${h / 2 - 36} L 40,${h / 2 - 36}`} stroke={pal.fg} strokeWidth={line * 0.7} strokeLinecap="round" />
      {/* Icônes, visibles quand l'écran est allumé */}
      <g opacity={screen}>
        {Array.from({ length: 9 }, (_, i) => {
          const x = gx + (i % 3) * (size + gap);
          const y = gy + Math.floor(i / 3) * (size + gap);
          return (
            <g key={i}>
              {i === 4 ? <rect x={x + 6} y={y + 6} width={size} height={size} rx={8} fill={pal.accent} /> : null}
              <rect x={x} y={y} width={size} height={size} rx={8} fill="none" stroke={icons} strokeWidth={6} />
            </g>
          );
        })}
      </g>
      {notify > 0.001 ? (
        <g transform={`translate(${w / 2 - 6}, ${-h / 2 + 6}) scale(${notify})`}>
          <circle r={34} fill={pal.accent} stroke={pal.fg} strokeWidth={8} />
        </g>
      ) : null}
    </g>
  );
};

/** Téléphone stylisé centré sur (0, 0). Couleurs tirées de la palette du plan. */
export const Phone: React.FC<{ screen?: number; notify?: number }> = ({ screen = 0, notify = 0 }) => {
  const pal = usePalette();
  const { on } = useRiso();
  if (on) return <RisoPhone screen={screen} notify={notify} />;
  const fill = interpolateColors(screen, [0, 1], [pal.screen, pal.accent]);
  const w = PHONE_W;
  const h = PHONE_H;
  const glyph = pal.bg === pal.accent ? pal.fg : "#EDE5D3";
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={52} fill={pal.fg} />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={40} fill={fill} />
      <rect x={-34} y={-h / 2 + 30} width={68} height={18} rx={9} fill={pal.fg} />
      <g opacity={screen}>
        <rect x={-62} y={-h / 2 + 108} width={124} height={22} rx={11} fill={glyph} opacity={0.9} />
        <rect x={-38} y={-h / 2 + 146} width={76} height={8} rx={4} fill={glyph} opacity={0.55} />
        <rect x={-50} y={h / 2 - 48} width={100} height={8} rx={4} fill={glyph} opacity={0.8} />
      </g>
      {notify > 0.001 ? (
        <g transform={`translate(${w / 2 - 6}, ${-h / 2 + 6}) scale(${notify})`}>
          <circle r={44} fill={pal.bg} />
          <circle r={32} fill={pal.accent} />
        </g>
      ) : null}
    </g>
  );
};
