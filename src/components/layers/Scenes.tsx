import React from "react";
import type { Layer } from "../../data/types";
import { usePalette } from "../../theme/ThemeContext";
import { useRiso } from "../riso";
import { mix, ramp, springy } from "./anim";

/*
 * SCÈNES : petites illustrations en trait d'encre, avec couche rouge décalée (riso).
 * Toutes centrées en (0, 0), environ 600 px de large à l'échelle 1.
 * Couleurs prises dans la palette du plan : fonctionnent sur les trois fonds.
 * Pour une nouvelle scène : ajoute son nom dans sceneKind (data/schema.ts), puis un composant ici.
 */

type SceneLayer = Extract<Layer, { type: "scene" }>;
type P = { t: number };

const ink = (color: string, w: number) => ({
  fill: "none",
  stroke: color,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Nuit : un lit sous la lune, la couverture respire, les yeux restent ouverts. */
const Night: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const breath = 1 + 0.04 * Math.sin(t * 1.8);
  const moonIn = ramp(t, 0.15, 0.6);
  const blink = t % 2.4 < 0.12 ? 0.2 : 1;
  const moon = "M 0,-80 A 80 80 0 1 0 0,80 A 100 100 0 0 1 0,-80 Z";
  const stars = [
    [-230, -310, 0],
    [-70, -380, 1.3],
    [40, -240, 2.1],
    [260, -110, 0.7],
  ];
  const blanket = "M -150,40 C -150,-25 -50,-50 40,-42 C 140,-34 245,-22 270,40 Z";
  return (
    <g>
      {/* Lune et étoiles */}
      <g transform={`translate(170, ${-270 + mix(30, 0, moonIn)})`} opacity={moonIn}>
        <path d={moon} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
        <path d={moon} {...ink(pal.fg, 7)} />
      </g>
      {stars.map(([x, y, ph], i) => {
        const o = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3 + ph));
        return (
          <path key={i} d={`M ${x - 14},${y} L ${x + 14},${y} M ${x},${y - 14} L ${x},${y + 14}`} {...ink(pal.fg, 5)} opacity={o * moonIn} />
        );
      })}
      {/* Lit */}
      <path d="M -280,140 L -280,-90 M -250,140 L -250,-60 M -280,-90 C -275,-100 -255,-100 -250,-90" {...ink(pal.fg, 8)} />
      <path d="M -250,40 L 280,40 L 280,140 M -250,100 L 280,100" {...ink(pal.fg, 8)} />
      <ellipse cx={-185} cy={22} rx={58} ry={22} {...ink(pal.fg, 6)} />
      {/* Tête, yeux grands ouverts */}
      <circle cx={-172} cy={-14} r={34} {...ink(pal.fg, 7)} />
      <circle cx={-184} cy={-20} r={5 * blink} fill={pal.fg} />
      <circle cx={-162} cy={-20} r={5 * blink} fill={pal.fg} />
      {/* Couverture qui respire, avec sa couche rouge */}
      <g transform={`translate(0, 40) scale(1, ${breath}) translate(0, -40)`}>
        <path d={blanket} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
        <path d={blanket} fill={pal.bg} />
        <path d={blanket} {...ink(pal.fg, 8)} />
        <path d="M -40,-20 C 0,-5 60,-8 110,-18" {...ink(pal.fg, 5)} opacity={0.6} />
      </g>
    </g>
  );
};

/** Souvenir : des petites bulles remontent, une grande bulle s'ouvre sur une scène gênante. */
const Memory: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const grow = Math.max(0, springy(t, 0.35, 0.8));
  const r = 220 * grow;
  const drift = -10 * Math.min(t, 4);
  const trail = [
    { x: -130, y: 340, r: 16, at: 0.02 },
    { x: -100, y: 280, r: 26, at: 0.12 },
    { x: -55, y: 210, r: 38, at: 0.22 },
  ];
  const inside = ramp(t, 0.75, 0.4);
  const flush = ramp(t, 1.1, 0.6);
  return (
    <g transform={`translate(0, ${drift})`}>
      {trail.map((b, i) => {
        const k = Math.max(0, springy(t, b.at, 0.45));
        return (
          <g key={i} transform={`translate(${b.x}, ${b.y}) scale(${k})`}>
            <circle cx={dx} cy={dy} r={b.r} fill={pal.shadow} opacity={0.92} />
            <circle r={b.r} fill={pal.bg} />
            <circle r={b.r} {...ink(pal.fg, 6)} />
          </g>
        );
      })}
      {r > 1 ? (
        <g>
          <circle cx={dx * 1.5} cy={dy * 1.5} r={r} fill={pal.shadow} opacity={0.92} />
          <circle r={r} fill={pal.bg} />
          <circle r={r} {...ink(pal.fg, 8)} />
        </g>
      ) : null}
      {/* La scène dans la bulle : un personnage qui rougit, une réplique en suspens */}
      <g opacity={inside}>
        <circle cx={-55} cy={-40} r={34} {...ink(pal.fg, 6)} />
        <path d="M -55,-6 L -55,90 M -55,20 L -95,60 M -55,20 L -15,55 M -55,90 L -85,140 M -55,90 L -25,140" {...ink(pal.fg, 6)} />
        <ellipse cx={-38} cy={-30} rx={11} ry={7} fill={pal.accent} opacity={flush} />
        <path d="M 10,-130 L 140,-130 L 140,-60 L 45,-60 L 25,-38 L 30,-60 L 10,-60 Z" {...ink(pal.fg, 6)} />
        {[45, 75, 105].map((x, i) => (
          <circle key={i} cx={x} cy={-95} r={7} fill={pal.fg} opacity={ramp(t, 1 + i * 0.25, 0.15)} />
        ))}
      </g>
    </g>
  );
};

/** Rougeur : un visage qui détourne le regard, les joues rougissent, la chaleur monte. */
const Blush: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const k = ramp(t, 0.3, 1.0, "inOut");
  const drop = ramp(t, 0.9, 0.4);
  const heat = ramp(t, 1.1, 0.5);
  const look = 10 + 3 * Math.sin(t * 2);
  const cheeks = [-95, 95];
  return (
    <g>
      {/* Chaleur qui monte au-dessus de la tête */}
      {[-60, 0, 60].map((x, i) => (
        <path
          key={i}
          d={`M ${x},-235 q 12,-18 0,-36 q -12,-18 0,-36`}
          {...ink(pal.accent, 7)}
          opacity={heat}
          transform={`translate(0, ${-10 * Math.sin(t * 2.5 + i)})`}
        />
      ))}
      {/* Tête et cheveux */}
      <ellipse cx={0} cy={0} rx={165} ry={195} {...ink(pal.fg, 8)} />
      <path d="M -155,-70 C -150,-190 150,-200 160,-70 M -110,-150 C -80,-110 -40,-120 -20,-160 M -10,-165 C 20,-120 70,-125 90,-160" {...ink(pal.fg, 7)} />
      {/* Joues : couche rouge décalée qui grandit */}
      {cheeks.map((x, i) => (
        <g key={i}>
          <ellipse cx={x + dx} cy={48 + dy} rx={58 * mix(0.3, 1, k)} ry={34 * mix(0.3, 1, k)} fill={pal.accent} opacity={0.92 * k} />
          {[-20, 0, 20].map((h) => (
            <path key={h} d={`M ${x + h - 8},${62} L ${x + h + 8},${34}`} {...ink(pal.fg, 4)} opacity={k} />
          ))}
        </g>
      ))}
      {/* Yeux qui fuient sur le côté */}
      <circle cx={-55} cy={-25} r={24} {...ink(pal.fg, 6)} />
      <circle cx={55} cy={-25} r={24} {...ink(pal.fg, 6)} />
      <circle cx={-55 + look} cy={-25} r={9} fill={pal.fg} />
      <circle cx={55 + look} cy={-25} r={9} fill={pal.fg} />
      <path d="M -82,-65 L -30,-58 M 30,-58 L 82,-65" {...ink(pal.fg, 6)} />
      {/* Bouche crispée */}
      <path d="M -40,95 q 10,-10 20,0 q 10,10 20,0 q 10,-10 20,0 q 10,10 20,0" {...ink(pal.fg, 6)} />
      {/* Goutte */}
      <g opacity={drop} transform={`translate(185, ${-70 + 25 * drop})`}>
        <path d="M 0,-26 C 10,-8 16,4 16,12 A 16 16 0 0 1 -16,12 C -16,4 -10,-8 0,-26 Z" transform={`translate(${dx * 0.6}, ${dy * 0.6})`} fill={pal.shadow} opacity={0.92} />
        <path d="M 0,-26 C 10,-8 16,4 16,12 A 16 16 0 0 1 -16,12 C -16,4 -10,-8 0,-26 Z" {...ink(pal.fg, 5)} />
      </g>
    </g>
  );
};

export const Scene: React.FC<{ layer: SceneLayer; t: number; d: number }> = ({ layer, t }) => {
  const lt = t - (layer.at ?? 0);
  const k = ramp(lt, 0, 0.45);
  const inner =
    layer.kind === "night" ? <Night t={lt} /> : layer.kind === "memory" ? <Memory t={lt} /> : <Blush t={lt} />;
  return (
    <g transform={`translate(${layer.x}, ${layer.y + mix(50, 0, k)}) scale(${layer.scale})`} opacity={k}>
      {inner}
    </g>
  );
};
