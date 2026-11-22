import React from "react";
import { interpolateColors } from "remotion";
import { usePalette } from "../../theme/ThemeContext";

export const PHONE_W = 300;
export const PHONE_H = 600;

/** Téléphone stylisé centré sur (0, 0). Couleurs tirées de la palette du plan. */
export const Phone: React.FC<{ screen?: number; notify?: number }> = ({ screen = 0, notify = 0 }) => {
  const pal = usePalette();
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
