import React from "react";
import { interpolate, Easing } from "remotion";
import type { MascotLayer } from "../../data/types";

type MascotMood = MascotLayer["mood"];

const VB = { x: -135, y: -155, w: 270, h: 265 };

// Silhouette ovoïde cabossée (relief d'écailles sur le contour) + col en creux
const BODY_PATH = `
  M 0,-62
  C 12,-66 26,-62 36,-53
  C 42,-48 48,-42 52,-33
  C 56,-25 58,-15 57,-5
  C 59,4 57,14 53,23
  C 51,32 45,41 38,48
  C 31,56 21,62 11,65
  C 4,68 -4,68 -11,65
  C -21,62 -31,56 -38,48
  C -45,41 -51,32 -53,23
  C -57,14 -59,4 -57,-5
  C -58,-15 -56,-25 -52,-33
  C -48,-42 -42,-48 -36,-53
  C -26,-62 -12,-66 0,-62 Z
`;
const STEM_PATH = "M 0,-62 C -1,-73 3,-82 9,-86";

// Écailles en quinconce (petits chevrons arrondis)
const SCALES_PATH = [
  [-26, -46], [0, -49], [26, -46],
  [-38, -32], [-14, -35], [14, -35], [38, -32],
  [-45, -14], [-32, -16], [32, -16], [45, -14],
  [-45,   6], [-33,   8], [33,   8], [45,   6],
  [-38,  26], [-15,  24], [15,  24], [38,  26],
  [-26,  42], [  0,  40], [26,  42],
  [-12,  54], [ 12,  54],
]
  .map(([sx, sy]) => `M ${sx - 5.5},${sy + 2.2} Q ${sx},${sy - 3.2} ${sx + 5.5},${sy + 2.2}`)
  .join(" ");

const INK = "#1C1A19";
const PAPER = "#F3ECE0";
const RISO_RED = "#E0485A";
const RISO_STEM = "#8C6D53";
const RISO_ORANGE = "#E87A3D";
const RISO_BLUE = "#7FAEC9";

const Face: React.FC<{ mood: MascotMood; blink: number; ink: string }> = ({
  mood,
  blink,
  ink,
}) => {
  const strokeProps = {
    stroke: ink,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  switch (mood) {
    case "perplexe":
      return (
        <>
          <line x1={-22} y1={-2} x2={-10} y2={-2} {...strokeProps} strokeWidth={2.6} />
          <circle cx={15} cy={-2} r={4.3 * blink} fill={ink} />
          <path d="M 9,-12 Q 15,-17 22,-11" {...strokeProps} strokeWidth={2.2} />
          <line x1={-6} y1={11} x2={6} y2={8} {...strokeProps} strokeWidth={2.2} />
        </>
      );

    case "surpris":
      return (
        <>
          <circle cx={-15} cy={-3} r={5 * blink} {...strokeProps} strokeWidth={2.3} />
          <circle cx={15} cy={-3} r={5 * blink} {...strokeProps} strokeWidth={2.3} />
          <path d="M -21,-14 Q -15,-18 -9,-14" {...strokeProps} strokeWidth={2} />
          <path d="M 9,-14 Q 15,-18 21,-14" {...strokeProps} strokeWidth={2} />
          <circle cx={0} cy={11} r={3.1} {...strokeProps} strokeWidth={2.1} />
        </>
      );

    case "reveur":
      return (
        <>
          <path d="M -21,-2 Q -15,4 -9,-2" {...strokeProps} strokeWidth={2.3} />
          <path d="M 9,-2 Q 15,4 21,-2" {...strokeProps} strokeWidth={2.3} />
          <path d="M -4,9 Q 0,12 4,9" {...strokeProps} strokeWidth={2} />
        </>
      );

    case "gene":
      return (
        <>
          <circle cx={-15} cy={-1} r={3.5 * blink} fill={ink} />
          <circle cx={15} cy={-1} r={3.5 * blink} fill={ink} />
          <line x1={-21} y1={-7} x2={-10} y2={-11} {...strokeProps} strokeWidth={2.2} />
          <line x1={10} y1={-11} x2={21} y2={-7} {...strokeProps} strokeWidth={2.2} />
          <path d="M -6,10 Q -3,8 0,10 Q 3,12 6,10" {...strokeProps} strokeWidth={2.1} />
        </>
      );

    default:
      return (
        <>
          <circle cx={-15} cy={-2} r={3.7 * blink} fill={ink} />
          <circle cx={15} cy={-2} r={3.7 * blink} fill={ink} />
          <path d="M -6,8 Q 0,14 6,8" {...strokeProps} strokeWidth={2.2} />
        </>
      );
  }
};

const Accessory: React.FC<{
  mood: MascotMood;
  pop: number;
  t: number;
  ink: string;
}> = ({ mood, pop, t, ink }) => {
  if (pop <= 0.01) return null;

  if (mood === "perplexe") {
    const wiggle = Math.sin(t * 3.5) * 6;
    return (
      <g transform={`translate(60 -74) rotate(${wiggle}) scale(${pop})`}>
        <text
          x={2.5}
          y={2}
          textAnchor="middle"
          fontSize={34}
          fontWeight={800}
          fontFamily="Georgia, serif"
          fill={RISO_ORANGE}
        >
          ?
        </text>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          fontSize={34}
          fontWeight={800}
          fontFamily="Georgia, serif"
          fill="none"
          stroke={ink}
          strokeWidth={1.6}
        >
          ?
        </text>
      </g>
    );
  }

  if (mood === "reveur") {
    const float = Math.sin(t * 2) * 3.5;
    return (
      <g transform={`translate(0 ${float}) scale(${pop})`}>
        <circle cx={48} cy={-64} r={3.8} fill={RISO_RED} opacity={0.65} />
        <circle cx={47} cy={-65} r={3.8} fill="none" stroke={ink} strokeWidth={1.8} />

        <circle cx={62} cy={-84} r={7} fill={RISO_RED} opacity={0.65} />
        <circle cx={61} cy={-85} r={7} fill="none" stroke={ink} strokeWidth={1.8} />

        <circle cx={84} cy={-110} r={14.5} fill={RISO_RED} opacity={0.65} />
        <circle cx={82} cy={-112} r={14.5} fill="none" stroke={ink} strokeWidth={1.8} />
      </g>
    );
  }

  if (mood === "gene") {
    const slide = (t * 5) % 6;
    const dropPath =
      "M 0,-10 C 4,-3 7,1 7,5 A 7,7 0 0 1 -7,5 C -7,1 -4,-3 0,-10 Z";
    return (
      <g transform={`translate(46 ${-26 + slide}) scale(${pop})`}>
        <path d={dropPath} fill={RISO_BLUE} transform="translate(2, 1.5)" />
        <path d={dropPath} fill="none" stroke={ink} strokeWidth={1.8} />
      </g>
    );
  }

  return null;
};

export const Mascot: React.FC<{ layer: MascotLayer; t: number; d: number }> = ({
  layer,
  t: shotT,
}) => {
  const { x, y, scale, mood = "content", onDark = false, enterAt = 0 } = layer;
  const t = shotT - enterAt;
  if (t < 0) return null;

  // Le litchi garde toujours son trait d'encre foncé (même personnage sur tous les fonds).
  // Sur fond sombre, il est posé comme un autocollant : papier crème sous la couleur.
  // Seuls les accessoires, qui flottent sur le fond, passent en clair.
  const ink = INK;
  const accInk = onDark ? PAPER : INK;

  // Apparition cinématique amortie
  const enter = interpolate(t, [0, 0.85], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const enterLift = (1 - enter) * 26;
  const floatY = enterLift + Math.sin(t * 1.8) * 3.2;

  // Inclinaison et regard subtils
  const targetTilt = mood === "perplexe" ? -6 : mood === "gene" ? 4 : 0;
  const tilt = targetTilt + Math.sin(t * 1.1) * 1.6;

  const lookX =
    mood === "perplexe"
      ? 3.5
      : mood === "gene"
      ? 5
      : Math.sin(t * 0.9) * 2.4;
  const lookY =
    mood === "surpris"
      ? -2.5
      : mood === "reveur"
      ? -1.5
      : Math.cos(t * 1.3) * 1.2;

  // Clignement naturel
  const phase = (t + 1.4) % 3.8;
  const blink =
    phase < 0.15 ? Math.max(0.08, Math.abs(phase / 0.075 - 1)) : 1;

  // Apparition douce des accessoires
  const pop = interpolate(t, [0.25, 0.7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.4)),
  });

  const w = VB.w * scale;
  const h = VB.h * scale;
  const left = x + VB.x * scale;
  const top = y + VB.y * scale;

  return (
    <svg
      viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
      x={left}
      y={top}
      width={w}
      height={h}
      overflow="visible"
      style={{
        position: "absolute",
        left,
        top,
        overflow: "visible",
        opacity: enter,
      }}
    >
      {/* Ombre minimale au sol */}
      <ellipse
        cx={0}
        cy={90}
        rx={30 - floatY * 0.4}
        ry={3.5}
        fill={onDark ? PAPER : INK}
        opacity={(onDark ? 0.12 : 0.14) * enter}
      />

      <g transform={`translate(0 ${floatY}) rotate(${tilt})`}>
        {/* Fond sombre : support papier crème avec un liseré, comme un autocollant */}
        {onDark ? (
          <g>
            <path d={STEM_PATH} stroke={PAPER} strokeWidth={11} fill="none" strokeLinecap="round" />
            <circle cx={9.5} cy={-86.5} r={6} fill={PAPER} />
            <path d={BODY_PATH} fill={PAPER} stroke={PAPER} strokeWidth={16} strokeLinejoin="round" />
          </g>
        ) : null}

        {/* Couche couleur Risographie volontairement décalée */}
        <g transform={`translate(${5 + lookX * 0.15} ${4 + lookY * 0.15})`}>
          <path d={BODY_PATH} fill={RISO_RED} opacity={0.9} />
          <ellipse cx={0} cy={-62} rx={7} ry={2.5} fill={RISO_STEM} opacity={0.9} />
        </g>

        {/* Pédoncule sec et boisé (sans feuille) */}
        <path
          d="M -6,-62 Q 0,-59 6,-62"
          stroke={ink}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={STEM_PATH}
          stroke={ink}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={9.5} cy={-86.5} r={2} fill={ink} />

        {/* Contour organique cabossé du litchi */}
        <path
          d={BODY_PATH}
          fill="none"
          stroke={ink}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Écailles en quinconce (parallaxe légère) */}
        <g transform={`translate(${lookX * 0.3} ${lookY * 0.3})`}>
          <path
            d={SCALES_PATH}
            stroke={ink}
            strokeWidth={1.65}
            fill="none"
            opacity={0.6}
            strokeLinecap="round"
          />
        </g>

        {/* Regard & expression */}
        <g transform={`translate(${lookX} ${lookY})`}>
          <Face mood={mood} blink={blink} ink={ink} />
        </g>

        {/* Accessoires contextuels en style Riso */}
        <Accessory mood={mood} pop={pop} t={t} ink={accInk} />
      </g>
    </svg>
  );
};
