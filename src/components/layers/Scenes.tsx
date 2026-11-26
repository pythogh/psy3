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

/** Nuit : un lit vu de dessus sous la lune, la couverture respire, les yeux restent ouverts. */
const Night: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const breath = 1 + 0.03 * Math.sin(t * 1.8);
  const moonIn = ramp(t, 0.15, 0.6);
  const blink = t % 2.4 < 0.12 ? 0.2 : 1;
  const moon = "M 0,-60 A 60 60 0 1 0 0,60 A 75 75 0 0 1 0,-60 Z";
  const stars = [
    [-235, -250, 0],
    [-200, 60, 1.3],
    [215, -110, 2.1],
    [230, 150, 0.7],
  ];
  const blanket = "M -128,-45 C -80,-58 -30,-40 0,-50 C 35,-60 85,-42 128,-50 L 128,218 L -128,218 Z";
  return (
    <g>
      {/* Lune et étoiles */}
      <g transform={`translate(225, ${-255 + mix(25, 0, moonIn)})`} opacity={moonIn}>
        <path d={moon} transform={`translate(${dx * 1.2}, ${dy * 1.2})`} fill={pal.shadow} opacity={0.92} />
        <path d={moon} {...ink(pal.fg, 7)} />
      </g>
      {stars.map(([x, y, ph], i) => {
        const o = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3 + ph));
        return (
          <path key={i} d={`M ${x - 13},${y} L ${x + 13},${y} M ${x},${y - 13} L ${x},${y + 13}`} {...ink(pal.fg, 5)} opacity={o * moonIn} />
        );
      })}
      {/* Lit vu de dessus : cadre, tête de lit, oreiller */}
      <rect x={-140} y={-170} width={280} height={400} rx={18} {...ink(pal.fg, 8)} />
      <path d="M -160,-178 L 160,-178" {...ink(pal.fg, 12)} />
      <rect x={-95} y={-155} width={190} height={78} rx={32} {...ink(pal.fg, 6)} />
      {/* Visage de face sur l'oreiller, yeux grands ouverts */}
      <circle cx={0} cy={-108} r={44} fill={pal.bg} />
      <circle cx={0} cy={-108} r={44} {...ink(pal.fg, 7)} />
      <path d="M -40,-122 C -30,-158 30,-158 40,-122" {...ink(pal.fg, 6)} />
      <circle cx={-15} cy={-108} r={9} {...ink(pal.fg, 4)} />
      <circle cx={15} cy={-108} r={9} {...ink(pal.fg, 4)} />
      <circle cx={-15} cy={-108} r={4.5 * blink} fill={pal.fg} />
      <circle cx={15} cy={-108} r={4.5 * blink} fill={pal.fg} />
      <path d="M -8,-84 L 8,-84" {...ink(pal.fg, 4)} />
      {/* Couverture qui respire, avec sa couche rouge, et les mains qui la tiennent */}
      <g transform={`translate(0, 85) scale(${breath}) translate(0, -85)`}>
        <path d={blanket} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
        <path d={blanket} fill={pal.bg} />
        <path d={blanket} {...ink(pal.fg, 8)} />
        <path d="M -128,-12 L 128,-20 M -60,40 C -40,110 -50,160 -30,210 M 55,30 C 70,100 60,150 80,210" {...ink(pal.fg, 4)} opacity={0.55} />
        <circle cx={-48} cy={-50} r={14} fill={pal.bg} />
        <circle cx={-48} cy={-50} r={14} {...ink(pal.fg, 5)} />
        <circle cx={48} cy={-52} r={14} fill={pal.bg} />
        <circle cx={48} cy={-52} r={14} {...ink(pal.fg, 5)} />
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

/** Couverture : au lit, on remonte la couverture jusqu'au nez ; yeux ronds, joues rouges. */
const Covers: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const k = ramp(t, 0.3, 1.0, "inOut");
  const pull = mix(150, 10, ramp(t, 0.2, 0.9, "inOut"));
  const blink = t % 2.2 < 0.12 ? 0.2 : 1;
  const edge = `M -260,${pull} C -150,${pull - 18} -60,${pull + 10} 0,${pull - 6} C 70,${pull - 20} 170,${pull + 8} 260,${pull - 4} L 260,260 L -260,260 Z`;
  return (
    <g>
      <rect x={-230} y={-230} width={460} height={160} rx={60} {...ink(pal.fg, 7)} />
      <circle cx={0} cy={-40} r={130} fill={pal.bg} />
      <circle cx={0} cy={-40} r={130} {...ink(pal.fg, 8)} />
      <path d="M -125,-80 C -110,-190 110,-190 125,-80" {...ink(pal.fg, 7)} />
      {[-70, 70].map((x, i) => (
        <ellipse key={i} cx={x + dx} cy={-5 + dy} rx={36 * mix(0.3, 1, k)} ry={22 * mix(0.3, 1, k)} fill={pal.accent} opacity={0.92 * k} />
      ))}
      <circle cx={-45} cy={-60} r={20} {...ink(pal.fg, 6)} />
      <circle cx={45} cy={-60} r={20} {...ink(pal.fg, 6)} />
      <circle cx={-45} cy={-60} r={8 * blink} fill={pal.fg} />
      <circle cx={45} cy={-60} r={8 * blink} fill={pal.fg} />
      <path d={edge} transform={`translate(${dx * 1.4}, ${dy * 1.4})`} fill={pal.shadow} opacity={0.92} />
      <path d={edge} fill={pal.bg} />
      <path d={edge} {...ink(pal.fg, 8)} />
      {[-70, 70].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={pull - 4} r={22} fill={pal.bg} />
          <circle cx={x} cy={pull - 4} r={22} {...ink(pal.fg, 6)} />
        </g>
      ))}
    </g>
  );
};

export const Scene: React.FC<{ layer: SceneLayer; t: number; d: number }> = ({ layer, t }) => {
  const lt = t - (layer.at ?? 0);
  const k = ramp(lt, 0, 0.45);
  const inner =
    layer.kind === "night" ? <Night t={lt} /> :
    layer.kind === "memory" ? <Memory t={lt} /> :
    layer.kind === "covers" ? <Covers t={lt} /> :
    <Blush t={lt} />;
  return (
    <g transform={`translate(${layer.x}, ${layer.y + mix(50, 0, k)}) scale(${layer.scale})`} opacity={k}>
      {inner}
    </g>
  );
};
