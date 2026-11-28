import React from "react";
import type { Layer } from "../../data/types";
import { usePalette, useTheme } from "../../theme/ThemeContext";
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
  // Plus petite que les autres scènes à l'échelle 1 : le personnage ne doit pas envahir le cadre
  return (
    <g transform="scale(0.72)">
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

/** Cœur : une silhouette en buste, un point rouge bat dans la poitrine et des ondes partent du corps (la sensation qui reste). */
const Heart: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const k = ramp(t, 0.3, 0.6);
  const beat = 1 + 0.12 * Math.max(0, Math.sin(t * 6.5));
  const body = "M -190,230 C -190,60 -120,-40 0,-45 C 120,-40 190,60 190,230";
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.7 + i / 3) % 1;
        return <circle key={i} cx={0} cy={60} r={60 + 200 * ph} {...ink(pal.shadow, 7)} opacity={(1 - ph) * k} />;
      })}
      <circle cx={0} cy={-150} r={80} fill={pal.bg} />
      <circle cx={0} cy={-150} r={80} {...ink(pal.fg, 8)} />
      <path d={body} fill={pal.bg} />
      <path d={body} {...ink(pal.fg, 8)} />
      <g transform={`translate(0, 60) scale(${beat * k})`}>
        <circle cx={dx} cy={dy} r={48} fill={pal.shadow} opacity={0.92} />
        <circle r={48} {...ink(pal.fg, 6)} />
      </g>
    </g>
  );
};


/**
 * Café : deux collègues de profil, face à face de chaque côté d'une petite machine.
 * La tasse se remplit goutte à goutte, ils fixent la tasse ; de temps en temps leurs regards
 * se croisent, et ils les rebaissent aussitôt.
 */
const Coffee: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const fill = Math.min(0.85, 0.08 + t * 0.16);
  const look = (s: number) => ramp(t, s, 0.12) * (1 - ramp(t, s + 0.4, 0.12));
  const up = Math.max(look(1.0), look(2.5));
  const drop = (t * 2.6) % 1;
  // Machine sur le comptoir, au fond
  const machine = "M -85,-150 L 85,-150 L 85,70 L -85,70 Z";
  const cupY = 70;
  const cup = `M -32,${cupY - 52} L -26,${cupY} L 26,${cupY} L 32,${cupY - 52} Z`;
  const level = cupY - 50 * fill;
  // Têtes de profil : la gauche regarde à droite, la droite regarde à gauche
  const head = (cx: number, cy: number, f: number) =>
    `M ${cx - 58 * f},${cy + 10} C ${cx - 62 * f},${cy - 70} ${cx + 48 * f},${cy - 78} ${cx + 56 * f},${cy - 14} ` +
    `C ${cx + 60 * f},${cy - 6} ${cx + 74 * f},${cy + 4} ${cx + 60 * f},${cy + 14} ` +
    `C ${cx + 58 * f},${cy + 46} ${cx + 30 * f},${cy + 66} ${cx - 2 * f},${cy + 64} C ${cx - 34 * f},${cy + 62} ${cx - 56 * f},${cy + 40} ${cx - 58 * f},${cy + 10} Z`;
  const body = (cx: number, f: number) =>
    `M ${cx - 118 * f},300 C ${cx - 122 * f},130 ${cx - 80 * f},50 ${cx - 10 * f},50 C ${cx + 60 * f},50 ${cx + 100 * f},130 ${cx + 96 * f},300 Z`;
  const L = { cx: -222, cy: -12 };
  const R = { cx: 222, cy: -6 };
  const eye = (cx: number, cy: number, f: number) => ({ x: cx + 30 * f, y: cy - 14 + mix(9, 0, up) });
  const eL = eye(L.cx, L.cy, 1);
  const eR = eye(R.cx, R.cy, -1);
  return (
    <g>
      {/* Comptoir et machine */}
      <path d="M -330,70 L 330,70" {...ink(pal.fg, 6)} opacity={0.5} />
      <path d={machine} transform={`translate(${dx}, ${dy})`} fill={pal.shadow} opacity={0.92} />
      <path d={machine} fill={pal.bg} />
      <path d={machine} {...ink(pal.fg, 7)} />
      <rect x={-60} y={-130} width={120} height={44} rx={8} {...ink(pal.fg, 5)} />
      <circle cx={-34} cy={-108} r={10} fill={pal.shadow} opacity={0.5 + 0.5 * Math.sin(t * 5)} />
      <path d="M -12,-112 L 40,-112 M -12,-100 L 22,-100" {...ink(pal.fg, 4)} opacity={0.5} />
      <path d="M -60,-60 L 60,-60 M 0,-60 L 0,-40" {...ink(pal.fg, 6)} />
      {/* Goutte qui tombe, tasse qui se remplit très lentement */}
      <ellipse cx={0} cy={mix(-34, level - 6, drop)} rx={4} ry={6} fill={pal.shadow} opacity={drop < 0.9 ? 1 : 0} />
      <path d={`M -30,${level} L -27,${cupY - 2} L 27,${cupY - 2} L 30,${level} Z`} fill={pal.shadow} opacity={0.92} />
      <path d={cup} {...ink(pal.fg, 6)} />
      <path d={`M 32,${cupY - 42} C 50,${cupY - 42} 50,${cupY - 18} 30,${cupY - 18}`} {...ink(pal.fg, 5)} />
      {/* Collègue de gauche : cheveux courts, sweat à capuche */}
      <path d={body(L.cx, 1)} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
      <path d={body(L.cx, 1)} fill={pal.bg} />
      <path d={body(L.cx, 1)} {...ink(pal.fg, 8)} />
      <path d={`M ${L.cx - 70},72 C ${L.cx - 40},112 ${L.cx + 30},112 ${L.cx + 60},72`} {...ink(pal.fg, 5)} />
      <path d={`M ${L.cx - 10},97 L ${L.cx - 14},147 M ${L.cx + 14},97 L ${L.cx + 12},142`} {...ink(pal.fg, 4)} />
      <path d={head(L.cx, L.cy, 1)} fill={pal.bg} />
      <path d={head(L.cx, L.cy, 1)} {...ink(pal.fg, 7)} />
      <path d={`M ${L.cx - 60},${L.cy + 2} C ${L.cx - 70},${L.cy - 70} ${L.cx + 10},${L.cy - 100} ${L.cx + 52},${L.cy - 40} C ${L.cx + 20},${L.cy - 52} ${L.cx - 10},${L.cy - 30} ${L.cx - 24},${L.cy - 46} C ${L.cx - 34},${L.cy - 20} ${L.cx - 48},${L.cy - 8} ${L.cx - 60},${L.cy + 2} Z`} fill={pal.fg} />
      <path d={`M ${L.cx - 22},${L.cy + 4} q -14,4 -10,20`} {...ink(pal.fg, 4)} />
      <circle cx={eL.x} cy={eL.y} r={6} fill={pal.fg} />
      <path d={`M ${L.cx + 30},${L.cy + 38} L ${L.cx + 46},${L.cy + 36}`} {...ink(pal.fg, 4)} />
      {/* Collègue de droite : chignon, chemise à col */}
      <path d={body(R.cx, -1)} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
      <path d={body(R.cx, -1)} fill={pal.bg} />
      <path d={body(R.cx, -1)} {...ink(pal.fg, 8)} />
      <path d={`M ${R.cx - 40},60 L ${R.cx - 5},105 L ${R.cx + 25},60 M ${R.cx - 5},105 L ${R.cx - 5},300`} {...ink(pal.fg, 5)} />
      <circle cx={R.cx + 66} cy={R.cy - 52} r={30} fill={pal.bg} />
      <circle cx={R.cx + 66} cy={R.cy - 52} r={30} {...ink(pal.fg, 7)} />
      <path d={head(R.cx, R.cy, -1)} fill={pal.bg} />
      <path d={head(R.cx, R.cy, -1)} {...ink(pal.fg, 7)} />
      <path d={`M ${R.cx + 60},${R.cy + 10} C ${R.cx + 66},${R.cy - 60} ${R.cx - 10},${R.cy - 96} ${R.cx - 54},${R.cy - 30} C ${R.cx - 20},${R.cy - 50} ${R.cx + 20},${R.cy - 44} ${R.cx + 40},${R.cy - 20} C ${R.cx + 46},${R.cy - 6} ${R.cx + 52},${R.cy + 4} ${R.cx + 60},${R.cy + 10} Z`} fill={pal.fg} />
      <circle cx={eR.x} cy={eR.y} r={6} fill={pal.fg} />
      <path d={`M ${R.cx - 30},${R.cy + 38} L ${R.cx - 46},${R.cy + 36}`} {...ink(pal.fg, 4)} />
      {/* Petit trait de gêne quand les regards se croisent */}
      {[L.cx + 60, R.cx - 60].map((x, i) => (
        <path key={i} d={`M ${x},${-92} l ${i ? -10 : 10},-22 M ${x + (i ? -24 : 24)},${-80} l ${i ? -18 : 18},-14`} {...ink(pal.fg, 5)} opacity={up} />
      ))}
    </g>
  );
};


/**
 * Métronome : le balancier bat régulièrement, un petit trait jaillit à chaque bout de course.
 */
const Metronome: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const period = 0.9;
  const ph = (t / period) * Math.PI * 2;
  const ang = 14 * Math.sin(ph);
  const hit = Math.max(0, Math.abs(Math.sin(ph)) - 0.85) / 0.15;
  const side = Math.sin(ph) > 0 ? 1 : -1;
  const body = "M -150,230 L -70,-250 L 70,-250 L 150,230 Z";
  return (
    <g>
      <path d={body} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
      <path d={body} fill={pal.bg} />
      <path d={body} {...ink(pal.fg, 8)} />
      <path d="M -112,120 L 112,120" {...ink(pal.fg, 6)} />
      {[-60, -30, 0, 30, 60].map((x, i) => (
        <path key={i} d={`M ${x},${-170 + Math.abs(x) * 0.2} l ${x * 0.08},16`} {...ink(pal.fg, 4)} opacity={0.5} />
      ))}
      <g transform={`rotate(${ang}, 0, 120)`}>
        <path d="M 0,120 L 0,-200" {...ink(pal.fg, 9)} />
        <rect x={-15} y={-115} width={30} height={30} transform={`translate(${dx * 0.6}, ${dy * 0.6})`} fill={pal.shadow} />
        <rect x={-15} y={-115} width={30} height={30} {...ink(pal.fg, 5)} />
      </g>
      <circle cx={0} cy={120} r={11} fill={pal.fg} />
      <g opacity={hit}>
        <path d={`M ${side * 110},-215 l ${side * 26},-14 M ${side * 118},-175 l ${side * 30},0`} {...ink(pal.fg, 5)} />
      </g>
    </g>
  );
};


/**
 * Écrit… : ton message est envoyé et marqué lu ; en face, les trois petits points
 * « en train d'écrire » apparaissent, sautillent… puis disparaissent sans réponse.
 */
const Typing: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const mine = Math.max(0, springy(t, 0, 0.7));
  const seen = ramp(t, 0.4, 0.25);
  const showA = ramp(t, 0.65, 0.2) * (1 - ramp(t, 1.55, 0.3));
  const showB = ramp(t, 2.15, 0.2) * (1 - ramp(t, 2.75, 0.3));
  const show = Math.max(showA, showB);
  const quiet = ramp(t, 1.7, 0.4) * (1 - showB);
  const me = "M -140,-260 L 200,-260 C 230,-260 240,-240 240,-210 L 240,-130 C 240,-100 230,-85 200,-85 L 170,-85 L 180,-40 L 120,-85 L -140,-85 C -170,-85 -180,-100 -180,-130 L -180,-210 C -180,-240 -170,-260 -140,-260 Z";
  const them = "M -190,40 L -10,40 C 15,40 25,55 25,80 L 25,120 C 25,145 15,160 -10,160 L -190,160 C -215,160 -225,145 -225,120 L -225,80 C -225,55 -215,40 -190,40 Z";
  const check = (x: number) => `M ${x},-48 l 12,12 l 22,-26`;
  return (
    <g>
      {/* Ton message, envoyé */}
      <g transform={`translate(0, ${(1 - mine) * 40})`} opacity={Math.min(1, mine)}>
        <path d={me} transform={`translate(${dx * 1.2}, ${dy * 1.2})`} fill={pal.shadow} opacity={0.92} />
        <path d={me} fill={pal.bg} />
        <path d={me} {...ink(pal.fg, 8)} />
        <path d="M -140,-205 L 190,-205 M -140,-150 L 80,-150" {...ink(pal.fg, 7)} opacity={0.45} />
      </g>
      {/* Lu */}
      <g opacity={seen}>
        <path d={check(60)} {...ink(pal.shadow, 7)} />
        <path d={check(82)} {...ink(pal.shadow, 7)} />
      </g>
      {/* En face : « en train d'écrire… » */}
      <g opacity={show} transform={`translate(-100, 100) scale(${mix(0.85, 1, show)}) translate(100, -100)`}>
        <path d={them} transform={`translate(${dx}, ${dy})`} fill={pal.shadow} opacity={0.92} />
        <path d={them} fill={pal.bg} />
        <path d={them} {...ink(pal.fg, 8)} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-150 + i * 55} cy={100 - 10 * Math.max(0, Math.sin(t * 9 - i * 0.9))} r={14} fill={pal.fg} />
        ))}
      </g>
      {/* Plus rien : la place vide, en pointillés */}
      <path d={them} {...ink(pal.fg, 5)} strokeDasharray="4 18" opacity={quiet * 0.5} />
    </g>
  );
};

/**
 * Ticket de caisse : il sort de l'imprimante et se déroule sans fin vers le bas,
 * les lignes défilent, puis la dernière ligne « TOTAL » s'imprime sur un bandeau rouge.
 */
const Receipt: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const theme = useTheme();
  const { dx, dy } = useRiso();
  const H = 560;
  const L = H * ramp(t, 0.1, 1.3, "inOut");
  const top = -262;
  const sway = 1.5 * Math.sin(t * 2.2);
  const total = ramp(t, 1.25, 0.3);
  const teeth = Array.from({ length: 13 }, (_, i) => `L ${170 - (i + 1) * 26},${H + (i % 2 === 0 ? 14 : 0)}`).join(" ");
  const paper = `M -170,0 L 170,0 L 170,${H} ${teeth} Z`;
  const rows = [70, 115, 160, 205, 250, 295, 340, 385];
  return (
    <g>
      <defs>
        <clipPath id="receipt-out-clip">
          <rect x={-400} y={top} width={800} height={1000} />
        </clipPath>
      </defs>
      <g clipPath="url(#receipt-out-clip)">
        <g transform={`translate(0, ${top - H + L}) rotate(${sway}, 0, ${H - L})`}>
          <path d={paper} transform={`translate(${dx * 1.3}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
          <path d={paper} fill={pal.bg} />
          <path d={paper} {...ink(pal.fg, 7)} />
          {rows.map((y, i) => (
            <g key={y}>
              <path d={`M -135,${y} L ${-5 - (i % 3) * 30},${y}`} {...ink(pal.muted, 11)} />
              <path d={`M ${70 + (i % 2) * 15},${y} L 135,${y}`} {...ink(pal.muted, 11)} />
            </g>
          ))}
          <path d={`M -140,${H - 130} L 140,${H - 130}`} {...ink(pal.fg, 4)} strokeDasharray="2 12" />
          <g opacity={total}>
            <rect x={-152} y={H - 105} width={304} height={62} rx={10} fill={pal.shadow} />
            <text x={-136} y={H - 61} fontFamily={theme.font.family} fontSize={38} fontWeight={800} fill={pal.fg}>
              TOTAL
            </text>
            <text x={136} y={H - 61} textAnchor="end" fontFamily={theme.font.family} fontSize={38} fontWeight={800} fill={pal.fg}>
              40 €
            </text>
          </g>
        </g>
      </g>
      {/* Fente de l'imprimante */}
      <rect x={-215 + dx} y={top - 34 + dy} width={430} height={40} rx={20} fill={pal.shadow} opacity={0.92} />
      <rect x={-215} y={top - 34} width={430} height={40} rx={20} fill={pal.fg} />
      <path d={`M -180,${top} L 180,${top}`} {...ink(pal.bg, 5)} />
    </g>
  );
};

/**
 * Chrono de panier : une fiche produit (un pull) dans un panier en ligne,
 * avec un bandeau rouge « Réservé encore 09:59 » dont le chrono défile et clignote.
 */
const Cart: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const theme = useTheme();
  const { dx, dy } = useRiso();
  const panel = { x: -260, y: -210, w: 520, h: 400 };
  const total = Math.max(0, 599 - Math.floor(Math.max(0, t - 0.35) / 0.1));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  const pill = ramp(t, 0.25, 0.3);
  const blink = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(t * 9));
  const pull = "M -40,-50 L -14,-58 C -8,-46 8,-46 14,-58 L 40,-50 L 62,-6 L 44,2 L 36,-18 L 36,48 L -36,48 L -36,-18 L -44,2 L -62,-6 Z";
  return (
    <g>
      <rect x={panel.x + dx * 1.3} y={panel.y + dy * 1.3} width={panel.w} height={panel.h} rx={34} fill={pal.shadow} opacity={0.92} />
      <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={34} fill={pal.bg} />
      <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={34} {...ink(pal.fg, 8)} />
      {/* Icône panier */}
      <g transform="translate(-200, -150)">
        <path d="M -30,-22 L -16,-22 L -4,22 L 34,22 L 44,-8 L -10,-8" {...ink(pal.fg, 6)} />
        <circle cx={2} cy={36} r={6} fill={pal.fg} />
        <circle cx={30} cy={36} r={6} fill={pal.fg} />
      </g>
      <path d="M -120,-160 L 60,-160" {...ink(pal.muted, 12)} />
      {/* Fiche produit : le pull */}
      <rect x={-225} y={-95} width={150} height={150} rx={20} {...ink(pal.fg, 6)} />
      <g transform="translate(-150, -18)">
        <path d={pull} transform={`translate(${dx * 0.8}, ${dy * 0.8})`} fill={pal.shadow} opacity={0.9} />
        <path d={pull} {...ink(pal.fg, 5)} fill={pal.bg} />
      </g>
      <path d="M -40,-70 L 190,-70" {...ink(pal.fg, 14)} />
      <path d="M -40,-25 L 120,-25" {...ink(pal.muted, 12)} />
      <path d="M -40,20 L 80,20" {...ink(pal.muted, 12)} />
      {/* Bandeau chrono */}
      <g transform={`translate(0, ${mix(30, 0, pill)})`} opacity={pill}>
        <rect x={-225} y={85} width={450} height={78} rx={39} fill={pal.shadow} opacity={blink} />
        <rect x={-225} y={85} width={450} height={78} rx={39} {...ink(pal.fg, 6)} />
        <circle cx={-182} cy={124} r={20} {...ink(pal.fg, 5)} />
        <path d={`M -182,124 L ${-182 + 12 * Math.sin(t * 6)},${124 - 12 * Math.cos(t * 6)}`} {...ink(pal.fg, 4)} />
        <text x={-148} y={139} fontFamily={theme.font.family} fontSize={42} fontWeight={700} fill={pal.fg} textLength={350} lengthAdjust="spacingAndGlyphs">
          Réservé encore {mm}:{ss}
        </text>
      </g>
    </g>
  );
};

/**
 * Paiement en un geste : sur un téléphone en trait d'encre, la feuille de paiement monte,
 * double clic sur le bouton latéral, petit rond qui tourne, puis grande coche. Moins d'une seconde.
 */
const Pay: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const theme = useTheme();
  const { dx, dy } = useRiso();
  const sheet = ramp(t, 0.15, 0.35);
  const press = (at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.06);
  const push = press(0.62) + press(0.8);
  const spin = ramp(t, 0.88, 0.1) * (1 - ramp(t, 1.2, 0.08));
  const done = Math.max(0, springy(t, 1.22, 0.45));
  const check = ramp(t, 1.25, 0.25);
  const card = ramp(t, 0.3, 0.3);
  return (
    <g>
      {/* Téléphone */}
      <rect x={-150 + dx * 1.3} y={-300 + dy * 1.3} width={300} height={600} rx={46} fill={pal.shadow} opacity={0.92} />
      <rect x={-150} y={-300} width={300} height={600} rx={46} fill={pal.bg} />
      <rect x={-150} y={-300} width={300} height={600} rx={46} {...ink(pal.fg, 9)} />
      <path d="M -30,-272 L 30,-272" {...ink(pal.fg, 8)} />
      {/* Bouton latéral, enfoncé deux fois */}
      <rect x={150 - 6 * push} y={-200} width={14} height={80} rx={6} fill={pal.fg} />
      {[0.62, 0.8].map((at, i) => {
        const p = ramp(t, at, 0.25);
        return (
          <path key={i} d={`M ${188 + 26 * p},-190 C ${206 + 26 * p},-170 ${206 + 26 * p},-150 ${188 + 26 * p},-130`} {...ink(pal.fg, 5)} opacity={p * (1 - ramp(t, at + 0.25, 0.2))} />
        );
      })}
      <text x={196} y={-212} fontFamily={theme.font.family} fontSize={44} fontWeight={800} fill={pal.fg} opacity={ramp(t, 0.8, 0.12) * (1 - ramp(t, 1.2, 0.2))}>
        ×2
      </text>
      {/* Feuille de paiement qui monte */}
      <g clipPath="url(#pay-screen-clip)">
        <defs>
          <clipPath id="pay-screen-clip">
            <rect x={-150} y={-300} width={300} height={600} rx={46} />
          </clipPath>
        </defs>
        <g transform={`translate(0, ${mix(420, 0, sheet)})`}>
          <rect x={-150} y={-60} width={300} height={380} rx={30} fill={pal.bg} />
          <path d="M -150,-30 C -150,-50 -135,-60 -115,-60 L 115,-60 C 135,-60 150,-50 150,-30" {...ink(pal.fg, 6)} />
          <path d="M -30,-42 L 30,-42" {...ink(pal.muted, 8)} />
          {/* Carte */}
          <g transform={`translate(0, ${mix(30, 0, card)})`} opacity={card * (1 - check)}>
            <rect x={-100 + dx} y={-10 + dy} width={200} height={124} rx={16} fill={pal.fg} opacity={0.85} />
            <rect x={-100} y={-10} width={200} height={124} rx={16} fill={pal.shadow} />
            <rect x={-100} y={-10} width={200} height={124} rx={16} {...ink(pal.fg, 6)} />
            <rect x={-74} y={18} width={36} height={28} rx={6} {...ink(pal.fg, 4)} />
            <path d="M -74,86 L 40,86" {...ink(pal.fg, 6)} />
          </g>
          <path d="M -90,165 L 20,165" {...ink(pal.muted, 10)} opacity={1 - check} />
          {/* Petit rond qui tourne */}
          <g opacity={spin} transform={`translate(0, 225) rotate(${t * 720})`}>
            <path d="M 0,-24 A 24 24 0 1 1 -24,0" {...ink(pal.fg, 6)} />
          </g>
          {/* Coche */}
          <g transform={`translate(0, 70) scale(${done})`} opacity={done > 0 ? 1 : 0}>
            <circle cx={dx * 1.2} cy={dy * 1.2} r={78} fill={pal.fg} opacity={0.85} />
            <circle r={78} fill={pal.shadow} />
            <circle r={78} {...ink(pal.fg, 7)} />
            <path d="M -34,2 L -8,28 L 38,-26" {...ink(pal.fg, 11)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
          </g>
          <text x={0} y={215} textAnchor="middle" fontFamily={theme.font.family} fontSize={36} fontWeight={700} fill={pal.fg} opacity={check}>
            Payé
          </text>
        </g>
      </g>
    </g>
  );
};

export const Scene: React.FC<{ layer: SceneLayer; t: number; d: number }> = ({ layer, t }) => {
  const lt = t - (layer.at ?? 0) + (layer.from ?? 0);
  const k = ramp(lt, 0, 0.45);
  const inner =
    layer.kind === "night" ? <Night t={lt} /> :
    layer.kind === "memory" ? <Memory t={lt} /> :
    layer.kind === "covers" ? <Covers t={lt} /> :
    layer.kind === "heart" ? <Heart t={lt} /> :
    layer.kind === "coffee" ? <Coffee t={lt} /> :
    layer.kind === "metronome" ? <Metronome t={lt} /> :
    layer.kind === "typing" ? <Typing t={lt} /> :
    layer.kind === "receipt" ? <Receipt t={lt} /> :
    layer.kind === "cart" ? <Cart t={lt} /> :
    layer.kind === "pay" ? <Pay t={lt} /> :
    <Blush t={lt} />;
  return (
    <g transform={`translate(${layer.x}, ${layer.y + mix(50, 0, k)}) scale(${layer.scale})`} opacity={k}>
      {inner}
    </g>
  );
};
