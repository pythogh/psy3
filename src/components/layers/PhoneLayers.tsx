import React from "react";
import type { PhoneGridLayer, PhoneLayer, PhoneRowLayer, ReachLayer } from "../../data/types";
import { usePalette } from "../../theme/ThemeContext";
import { Phone, PHONE_H, PHONE_W } from "../svg/Phone";
import { envelope, mix, ramp, springy } from "./anim";

type P<L> = { layer: L; t: number; d: number };

/** Téléphone seul, toujours en mouvement. */
export const PhoneView: React.FC<P<PhoneLayer>> = ({ layer, t }) => {
  const { x, y, scale, screen = "off", motion = "float", rotate = 0 } = layer;
  let dy = 0;
  let rot = rotate;
  let s = 1;
  if (motion === "float") dy = Math.sin(t * 2.2) * 12;
  if (motion === "pop") {
    s = springy(t, 0, 0.6);
    dy = (1 - Math.min(1, s)) * 120;
  }
  if (motion === "drop") {
    const k = ramp(t, 0.05, 0.55, "inOut");
    dy = mix(-140, 40, k);
    rot = rotate + mix(0, -9, k) + Math.sin(Math.max(0, t - 0.6) * 18) * 3 * Math.exp(-Math.max(0, t - 0.6) * 6);
  }
  if (motion === "shake") rot = rotate + Math.sin(t * 60) * 3 * envelope(t, 0.1, 0.5, 0.05, 0.2);

  let lit = 0;
  if (screen === "on") lit = 1;
  if (screen === "unlock") lit = ramp(t, 0.12, 0.12);
  if (screen === "flash") lit = envelope(t, 0.1, 0.55, 0.08, 0.2);
  const notify = layer.notifyAt !== undefined ? Math.max(0, springy(t, layer.notifyAt, 0.55)) : 0;

  return (
    <g transform={`translate(${x}, ${y + dy}) rotate(${rot}) scale(${scale * s})`}>
      <Phone screen={lit} notify={notify} />
    </g>
  );
};

/** Rangée de téléphones déverrouillés à tour de rôle, de plus en plus vite. */
export const PhoneRow: React.FC<P<PhoneRowLayer>> = ({ layer, t }) => {
  const w = PHONE_W * layer.scale;
  const gap = 40;
  const total = layer.count * w + (layer.count - 1) * gap;
  const x0 = 540 - total / 2 + w / 2;
  // Instants de déverrouillage : l'intervalle se réduit de 25 % à chaque fois
  const times: number[] = [];
  let at = 0.05;
  let step = layer.interval;
  while (at < 10) {
    times.push(at);
    at += step;
    step = Math.max(0.08, step * 0.75);
  }
  return (
    <g>
      {Array.from({ length: layer.count }, (_, i) => {
        const mine = times.filter((_, k) => k % layer.count === i);
        const lit = Math.max(0, ...mine.map((a) => envelope(t, a, 0.18, 0.04, 0.12)));
        const lift = lit * 24;
        return (
          <g key={i} transform={`translate(${x0 + i * (w + gap)}, ${layer.y - lift}) scale(${layer.scale})`}>
            <Phone screen={lit} />
          </g>
        );
      })}
    </g>
  );
};

/** Grille de téléphones vérifiés un par un ; seules certaines vérifications récompensent. */
export const PhoneGrid: React.FC<P<PhoneGridLayer>> = ({ layer, t }) => {
  const w = PHONE_W * layer.scale;
  const h = PHONE_H * layer.scale;
  const totalW = layer.columns * w + (layer.columns - 1) * layer.gap;
  const totalH = layer.rows * h + (layer.rows - 1) * layer.gap;
  const x0 = 540 - totalW / 2 + w / 2;
  const y0 = layer.y - totalH / 2 + h / 2;
  return (
    <g>
      {Array.from({ length: layer.columns * layer.rows }, (_, i) => {
        const checks = layer.checks.filter((c) => c.cell === i);
        const lit = Math.max(0, ...checks.map((c) => envelope(t, c.at, 0.3, 0.06, 0.2)));
        const notify = Math.max(0, ...checks.filter((c) => c.reward).map((c) => envelope(t, c.at + 0.08, 1.2, 0.25, 0.3)));
        const cx = x0 + (i % layer.columns) * (w + layer.gap);
        const cy = y0 + Math.floor(i / layer.columns) * (h + layer.gap) - lit * 20;
        return (
          <g key={i} transform={`translate(${cx}, ${cy}) scale(${layer.scale})`}>
            <Phone screen={lit} notify={notify} />
          </g>
        );
      })}
    </g>
  );
};

/** Un bras géométrique surgit du bas du cadre et saisit le téléphone. */
export const Reach: React.FC<P<ReachLayer>> = ({ layer, t }) => {
  const pal = usePalette();
  const k = ramp(t, Math.max(0, layer.at - 0.35), 0.35, "out");
  const armW = 120 * layer.scale * 1.6;
  const top = mix(2000, layer.y + 80 * layer.scale, k);
  const lit = ramp(t, layer.at, 0.1);
  const lift = ramp(t, layer.at + 0.05, 0.4) * -60;
  return (
    <g>
      <g transform={`translate(${layer.x}, ${layer.y + lift}) scale(${layer.scale})`}>
        <Phone screen={lit} />
      </g>
      {/* Avant-bras + pouce */}
      <rect x={layer.x - armW / 2} y={top + lift} width={armW} height={2200} rx={armW / 2} fill={pal.muted} />
      <rect
        x={layer.x - armW / 2 - 50 * layer.scale}
        y={top + lift + 40 * layer.scale}
        width={70 * layer.scale}
        height={160 * layer.scale}
        rx={35 * layer.scale}
        fill={pal.muted}
        transform={`rotate(-18, ${layer.x - armW / 2}, ${top + lift + 120 * layer.scale})`}
      />
    </g>
  );
};
