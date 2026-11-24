import React from "react";
import { spring, useVideoConfig } from "remotion";
import type { MascotLayer } from "../../data/types";

/*
 * MASCOTTE : le litchi kawaii de « Psychologie du quotidien ».
 * Dessin centré sur (0,0), rayon 64. Seuls les yeux, la bouche et les accessoires changent selon l'humeur.
 * Reçoit { layer, t, d } comme les autres calques (t = temps écoulé dans le plan, en s).
 * Animation : entrée en rebond (avec léger squash), puis balancement continu pivotant à la base, clignement des yeux.
 */

type MascotMood = MascotLayer["mood"];

const INK = "#141210";
const BODY = "#D0561A";
const SKIN = "#B5470F";
const LIGHT = "#E8834A";
const CHEEK = "#F2A07E";
const CREAM = "#F6EFE4";
const DROP = "#9CCFF0";

const GRAINS: [number, number, number][] = [
  [-34, -10, 2.8],
  [36, -24, 3],
  [40, 30, 2.5],
  [-30, 38, 3],
  [4, -38, 2.5],
  [10, 46, 2.8],
];

// Cadre assez large pour la feuille, la bulle, le « ? » et l'ombre
const VB = { x: -140, y: -165, w: 280, h: 275 };

const line = { stroke: INK, strokeWidth: 3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Cheeks: React.FC<{ strong?: boolean }> = ({ strong }) => (
  <>
    <ellipse cx={-32} cy={14} rx={strong ? 10 : 8} ry={strong ? 6 : 5} fill={CHEEK} />
    <ellipse cx={32} cy={14} rx={strong ? 10 : 8} ry={strong ? 6 : 5} fill={CHEEK} />
  </>
);

const DotEyes: React.FC<{ blink: number; leftR?: number }> = ({ blink, leftR = 5 }) => (
  <>
    <ellipse cx={-18} cy={2} rx={leftR} ry={leftR * blink} fill={INK} />
    <ellipse cx={18} cy={2} rx={5} ry={5 * blink} fill={INK} />
  </>
);

const Face: React.FC<{ mood: MascotMood; blink: number }> = ({ mood, blink }) => {
  switch (mood) {
    case "perplexe":
      return (
        <>
          <DotEyes blink={blink} leftR={4} />
          <path d="M11,-9 Q18,-13 25,-10" {...line} />
          <path d="M-7,15 Q-3.5,12 0,15 Q3.5,18 7,15" {...line} />
          <Cheeks />
        </>
      );
    case "surpris":
      return (
        <>
          {[-18, 18].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={0} rx={7} ry={7 * blink} fill={INK} />
              {blink > 0.6 && <circle cx={cx + 2.4} cy={-2.6} r={2.2} fill="#FFFFFF" />}
            </g>
          ))}
          <ellipse cx={0} cy={17} rx={5} ry={6.5} fill={INK} />
          <Cheeks />
        </>
      );
    case "reveur":
      return (
        <>
          <path d="M-24,1 Q-18,7 -12,1" {...line} />
          <path d="M12,1 Q18,7 24,1" {...line} />
          <path d="M-5,13 Q0,17 5,13" {...line} />
          <Cheeks />
        </>
      );
    case "gene":
      return (
        <>
          {[-18, 18].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={2} rx={7.5} ry={7 * blink} fill={CREAM} stroke={INK} strokeWidth={2} />
              {blink > 0.5 && <circle cx={cx + 3.6} cy={3} r={3.8} fill={INK} />}
            </g>
          ))}
          <path d="M-7,16 Q-3.5,13 0,16 Q3.5,19 7,16" {...line} />
          <Cheeks strong />
        </>
      );
    default:
      return (
        <>
          <DotEyes blink={blink} />
          <path d="M-8,12 Q-4,18 0,13 Q4,18 8,12" {...line} />
          <Cheeks />
        </>
      );
  }
};

/** Accessoires : apparaissent en petit pop un peu après l'entrée. */
const Accessory: React.FC<{ mood: MascotMood; pop: number; t: number }> = ({ mood, pop, t }) => {
  const at = (px: number, py: number, s: number) => `translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})`;
  if (mood === "perplexe") {
    const wiggle = Math.sin(t * 5) * 8;
    return (
      <g transform={`${at(66, -74, pop)} rotate(${wiggle} 66 -74)`}>
        <text
          x={66}
          y={-60}
          fontSize={44}
          fontWeight={900}
          textAnchor="middle"
          fontFamily="inherit"
          fill={LIGHT}
          stroke={INK}
          strokeWidth={2.5}
          paintOrder="stroke"
        >
          ?
        </text>
      </g>
    );
  }
  if (mood === "reveur") {
    const float = Math.sin(t * 2.2) * 4;
    return (
      <g transform={`${at(70, -100, pop)} translate(0 ${float})`}>
        <circle cx={50} cy={-72} r={5} fill={CREAM} stroke={INK} strokeWidth={2.5} />
        <circle cx={64} cy={-94} r={9} fill={CREAM} stroke={INK} strokeWidth={2.5} />
        <circle cx={92} cy={-128} r={21} fill={CREAM} stroke={INK} strokeWidth={2.5} />
      </g>
    );
  }
  if (mood === "gene") {
    const slide = ((t % 1.6) / 1.6) * 6;
    return (
      <g transform={`${at(50, -38, pop)} translate(50 ${-40 + slide})`}>
        <path d="M0,-12 C5,-4 8,1 8,5 A8,8 0 0 1 -8,5 C-8,1 -5,-4 0,-12 Z" fill={DROP} stroke={INK} strokeWidth={2} />
      </g>
    );
  }
  return null;
};

export const Mascot: React.FC<{ layer: MascotLayer; t: number; d: number }> = ({ layer, t: shotT }) => {
  const { x, y, scale, mood = "content", onDark = false, enterAt = 0 } = layer;
  const { fps } = useVideoConfig();
  const t = shotT - enterAt;
  if (t < 0) return null;
  const local = t * fps;

  // Entrée en rebond + squash/stretch
  const enter = spring({ frame: local, fps, config: { damping: 9, stiffness: 170, mass: 0.7 } });
  const sy = enter;
  const sx = enter * (1 - (enter - 1) * 0.5);
  const lift = (1 - Math.min(enter, 1)) * 60;

  // Balancement continu, qui démarre en douceur
  const settle = Math.min(1, t / 0.7);
  const tilt = mood === "perplexe" ? -12 : 0;
  const rot = tilt + Math.sin((2 * Math.PI * t) / 2.6) * 4 * settle;
  const bob = Math.sin((2 * Math.PI * t) / 1.3) * 4 * settle;

  // Clignement toutes les 3,4 s
  const phase = (t + 1.1) % 3.4;
  const blink = phase < 0.14 ? Math.max(0.1, Math.abs(phase / 0.07 - 1)) : 1;

  const pop = spring({ frame: local - 0.35 * fps, fps, config: { damping: 10, stiffness: 180 } });
  const leaf = onDark ? CREAM : INK;

  const w = VB.w * scale;
  const h = VB.h * scale;
  const left = x + VB.x * scale;
  const top = y + VB.y * scale;

  // x/y/width/height : placement dans un SVG parent ; style : placement dans un conteneur HTML
  return (
    <svg
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      x={left}
      y={top}
      width={w}
      height={h}
      overflow="visible"
      style={{ position: "absolute", left, top, overflow: "visible" }}
    >
      {/* Ombre au sol */}
      <ellipse cx={0} cy={84} rx={46 * (1 - bob / 40)} ry={7} fill={onDark ? "#000000" : INK} opacity={0.12 * Math.min(enter, 1)} />

      <g transform={`translate(0 ${lift - bob})`}>
        <g transform={`translate(0 64) rotate(${rot}) scale(${sx} ${sy}) translate(0 -64)`}>
          {/* Tige et feuille */}
          <path d="M0,-74 C-6,-86 -2,-96 6,-100" stroke={leaf} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M4,-92 C16,-104 34,-100 38,-90 C26,-84 12,-84 4,-92 Z" fill={leaf} />
          {/* Corps, peau granuleuse, reflet, grains */}
          <circle r={64} fill={BODY} />
          <circle r={64} fill="none" stroke={SKIN} strokeWidth={10} strokeDasharray="1 10" strokeLinecap="round" />
          <path d="M-44,-34 C-30,-52 -8,-58 10,-56 C-8,-50 -28,-42 -44,-34 Z" fill={LIGHT} />
          {GRAINS.map(([gx, gy, r]) => (
            <circle key={`${gx}-${gy}`} cx={gx} cy={gy} r={r} fill={SKIN} opacity={0.55} />
          ))}
          <Face mood={mood} blink={blink} />
          <Accessory mood={mood} pop={pop} t={t} />
        </g>
      </g>
    </svg>
  );
};
