import React from "react";
import type { Layer } from "../../data/types";
import { usePalette } from "../../theme/ThemeContext";
import { useRiso } from "../riso";
import { mix, ramp } from "./anim";

/*
 * MOTIFS : formes abstraites en trait d'encre, avec couche rouge décalée (riso).
 * Centrés en (0, 0), environ 600 px de large à l'échelle 1, couleurs de la palette du plan.
 * Pour un nouveau motif : ajoute son nom dans motifKind (data/schema.ts), puis un composant ici.
 */

type MotifLayer = Extract<Layer, { type: "motif" }>;
type P = { t: number };

const ink = (color: string, w: number) => ({
  fill: "none",
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

const toPath = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Tracé révélé progressivement (0 → 1), avec sa couche rouge décalée. */
const Drawn: React.FC<{ d: string; p: number; w: number }> = ({ d, p, w }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p };
  return (
    <g>
      <path d={d} {...ink(pal.shadow, w * 1.6)} {...dash} opacity={0.9} transform={`translate(${dx}, ${dy})`} />
      <path d={d} {...ink(pal.fg, w)} {...dash} />
    </g>
  );
};

/** Spirale qui s'enroule vers le centre (rumination, retour sur soi). */
const Spiral: React.FC<P> = ({ t }) => {
  const pts: [number, number][] = [];
  for (let a = 0; a <= Math.PI * 9; a += 0.12) {
    const r = 270 - a * 9;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return (
    <g transform={`rotate(${-18 * t})`}>
      <Drawn d={toPath(pts)} p={ramp(t, 0.05, 1.4)} w={8} />
    </g>
  );
};

/** Ondes concentriques qui partent d'un point (écho, souvenir qui revient). */
const Ripples: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const ph = (t * 0.55 + i / 5) % 1;
        const r = 50 + 250 * ph;
        const o = (1 - ph) * ramp(t, i * 0.08, 0.3);
        return (
          <g key={i} opacity={o}>
            {i % 2 === 0 ? <circle cx={dx} cy={dy} r={r} {...ink(pal.shadow, 10)} opacity={0.9} /> : null}
            <circle r={r} {...ink(pal.fg, 6)} />
          </g>
        );
      })}
      <circle cx={dx} cy={dy} r={42} fill={pal.shadow} opacity={0.92} />
      <circle r={42} {...ink(pal.fg, 7)} />
    </g>
  );
};

/** Lignes ondulées superposées dont l'amplitude monte (émotion qui enfle). */
const Waves: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const amp = mix(5, 42, ramp(t, 0.1, 1.3, "inOut"));
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = amp * (1 - Math.abs(i - 2) * 0.22);
        const pts: [number, number][] = [];
        for (let x = -280; x <= 280; x += 14) pts.push([x, -170 + i * 85 + a * Math.sin(x * 0.026 + t * 3 + i * 0.9)]);
        const d = toPath(pts);
        return (
          <g key={i} opacity={ramp(t, i * 0.07, 0.3)}>
            {i === 2 ? <path d={d} {...ink(pal.shadow, 16)} opacity={0.9} transform={`translate(${dx}, ${dy})`} /> : null}
            <path d={d} {...ink(pal.fg, 7)} />
          </g>
        );
      })}
    </g>
  );
};

/** Pelote : un fil qui s'emmêle en se dessinant (pensée qui vagabonde). */
const Knot: React.FC<P> = ({ t }) => {
  const pts: [number, number][] = [];
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.03) {
    pts.push([165 * Math.sin(2 * a) + 85 * Math.sin(5 * a + 1), 165 * Math.cos(3 * a) + 75 * Math.cos(4 * a + 0.5)]);
  }
  return (
    <g transform={`rotate(${8 * Math.sin(t * 0.8)})`}>
      <Drawn d={toPath(pts)} p={ramp(t, 0.05, 1.6, "inOut")} w={6} />
    </g>
  );
};

/** Orbite : petites formes qui tournent autour d'un centre (le regard des autres). */
const Orbit: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const bodies = [
    { r: 150, ph: 0, sp: 0.8, k: "c" },
    { r: 150, ph: Math.PI, sp: 0.8, k: "s" },
    { r: 225, ph: 1, sp: -0.55, k: "t" },
    { r: 225, ph: 3.6, sp: -0.55, k: "c", red: true },
    { r: 295, ph: 2.2, sp: 0.35, k: "s" },
    { r: 295, ph: 5, sp: 0.35, k: "t" },
  ];
  return (
    <g>
      {[150, 225, 295].map((r, i) => (
        <circle key={r} r={r} {...ink(pal.muted, 3)} strokeDasharray="4 16" opacity={ramp(t, i * 0.1, 0.4)} />
      ))}
      <circle cx={dx} cy={dy} r={62} fill={pal.shadow} opacity={0.92} />
      <circle r={62} {...ink(pal.fg, 8)} />
      {bodies.map((b, i) => {
        const a = b.ph + t * b.sp;
        const x = Math.cos(a) * b.r;
        const y = Math.sin(a) * b.r;
        const s = 20 * Math.max(0, Math.min(1, (t - 0.1 - i * 0.06) / 0.3));
        const shape =
          b.k === "c" ? <circle r={s} /> : b.k === "s" ? <rect x={-s} y={-s} width={s * 2} height={s * 2} /> : <path d={`M 0,${-s * 1.2} L ${s * 1.1},${s * 0.8} L ${-s * 1.1},${s * 0.8} Z`} />;
        return (
          <g key={i} transform={`translate(${x}, ${y})`}>
            {b.red ? <g transform={`translate(${dx}, ${dy})`} fill={pal.shadow} opacity={0.92}>{shape}</g> : null}
            <g {...ink(pal.fg, 6)}>{shape}</g>
          </g>
        );
      })}
    </g>
  );
};

/** Forme qui se fend en deux : une moitié garde la couche rouge (la sensation reste). */
const Split: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const crack = ramp(t, 0.15, 0.35);
  const sep = 75 * ramp(t, 0.5, 0.8, "inOut");
  const left = "M 0,-180 A 180 180 0 0 0 0,180 L 18,120 L -12,60 L 16,0 L -14,-60 L 14,-120 Z";
  const right = "M 0,-180 A 180 180 0 0 1 0,180 L 18,120 L -12,60 L 16,0 L -14,-60 L 14,-120 Z";
  return (
    <g>
      <g transform={`translate(${-sep}, ${sep * 0.15}) rotate(${-6 * (sep / 75)})`}>
        <path d={left} {...ink(pal.fg, 8)} />
      </g>
      <g transform={`translate(${sep}, ${-sep * 0.15}) rotate(${6 * (sep / 75)})`}>
        <path d={right} transform={`translate(${dx * 1.4}, ${dy * 1.4})`} fill={pal.shadow} opacity={0.92} />
        <path d={right} {...ink(pal.fg, 8)} />
      </g>
      <path d="M 14,-120 L -14,-60 L 16,0 L -12,60 L 18,120" {...ink(pal.fg, 6)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} opacity={1 - sep / 75} />
    </g>
  );
};

export const Motif: React.FC<{ layer: MotifLayer; t: number; d: number }> = ({ layer, t }) => {
  const lt = t - (layer.at ?? 0);
  const k = ramp(lt, 0, 0.4);
  const inner =
    layer.kind === "spiral" ? <Spiral t={lt} /> :
    layer.kind === "ripples" ? <Ripples t={lt} /> :
    layer.kind === "waves" ? <Waves t={lt} /> :
    layer.kind === "knot" ? <Knot t={lt} /> :
    layer.kind === "orbit" ? <Orbit t={lt} /> :
    <Split t={lt} />;
  return (
    <g transform={`translate(${layer.x}, ${layer.y}) scale(${layer.scale * mix(0.85, 1, k)})`} opacity={k}>
      {inner}
    </g>
  );
};
