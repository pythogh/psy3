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

/** Lignes ondulées qui traversent tout l'écran de gauche à droite, et dont l'amplitude monte (émotion qui enfle). */
const Waves: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const amp = mix(6, 42, ramp(t, 0.2, 1.4, "inOut"));
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = amp * (1 - Math.abs(i - 2) * 0.22);
        const pts: [number, number][] = [];
        for (let x = -660; x <= 660; x += 14) pts.push([x, -170 + i * 85 + a * Math.sin(x * 0.024 + t * 3 + i * 0.9)]);
        const d = toPath(pts);
        const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - ramp(t, i * 0.07, 0.9, "inOut") };
        return (
          <g key={i}>
            {i === 2 ? <path d={d} {...ink(pal.shadow, 16)} {...dash} opacity={0.9} transform={`translate(${dx}, ${dy})`} /> : null}
            <path d={d} {...ink(pal.fg, 7)} {...dash} />
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

/** Forme qui se fend : une moitié hachurée (la scène), l'autre rouge qui bat (la sensation), des éclats qui s'échappent. */
const Split: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const crack = ramp(t, 0.1, 0.35);
  const open = ramp(t, 0.4, 0.7, "inOut");
  const sep = 70 * open;
  const beat = 1 + 0.045 * Math.max(0, Math.sin(t * 7)) * open;
  const zig = "L 22,130 L -10,85 L 26,40 L -6,0 L 20,-45 L -14,-90 L 12,-135 Z";
  const left = `M 0,-185 A 185 185 0 0 0 0,185 ${zig}`;
  const right = `M 0,-185 A 185 185 0 0 1 0,185 ${zig}`;
  const shards = [
    { x: 0, y: -120, a: -1.9, r: 0 },
    { x: 5, y: 20, a: 0.4, r: 1 },
    { x: -5, y: 110, a: 2.4, r: 2 },
  ];
  return (
    <g>
      <defs>
        <clipPath id="split-left-clip">
          <path d={left} />
        </clipPath>
      </defs>
      {/* Moitié gauche : la scène, en hachures d'encre */}
      <g transform={`translate(${-sep}, ${sep * 0.12}) rotate(${-7 * open})`}>
        <g clipPath="url(#split-left-clip)" opacity={0.55}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M ${-260 + i * 26},200 L ${-60 + i * 26},-200`} {...ink(pal.fg, 4)} />
          ))}
        </g>
        <path d={left} {...ink(pal.fg, 8)} />
      </g>
      {/* Moitié droite : la sensation, rouge, qui bat */}
      <g transform={`translate(${sep}, ${-sep * 0.12}) rotate(${7 * open}) scale(${beat})`}>
        <path d={right} transform={`translate(${dx * 1.5}, ${dy * 1.5})`} fill={pal.shadow} opacity={0.92} />
        <path d={right} {...ink(pal.fg, 8)} />
        <path d="M 70,-60 C 95,-30 95,30 70,60 M 115,-85 C 150,-40 150,40 115,85" {...ink(pal.fg, 5)} opacity={open * (0.5 + 0.5 * Math.sin(t * 7))} />
      </g>
      {/* Fissure qui se dessine, puis éclats qui s'échappent */}
      <path d="M 0,-185 L 12,-135 L -14,-90 L 20,-45 L -6,0 L 26,40 L -10,85 L 22,130 L 0,185" {...ink(pal.fg, 6)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} opacity={1 - open} />
      {shards.map((c, i) => {
        const p = ramp(t, 0.45 + i * 0.08, 0.9);
        const x = c.x + Math.cos(c.a) * 40 * p;
        const y = c.y + Math.sin(c.a) * 40 * p - 60 * p;
        return (
          <path key={i} d="M -10,-8 L 12,-4 L -2,12 Z" transform={`translate(${x}, ${y}) rotate(${120 * p + c.r * 40})`} {...(i === 1 ? { fill: pal.shadow } : ink(pal.fg, 4))} opacity={p * (1 - ramp(t, 1.3, 0.4))} />
        );
      })}
    </g>
  );
};


/**
 * Échange : deux formes se renvoient une balle en rythme, une courbe pointillée garde la trace.
 * Vers le milieu du plan, la balle s'arrête en l'air entre les deux et tremble (le silence).
 */
const Rally: React.FC<P & { d: number }> = ({ t, d }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const cross = 0.42;
  const start = 0.1;
  const freezeAt = Math.max(0.9, d * 0.5);
  const uf = Math.floor((freezeAt - start) / cross) + 0.5;
  const u = Math.max(0, Math.min((t - start) / cross, uf));
  const frozen = (t - start) / cross >= uf;
  const hold = frozen ? t - (start + uf * cross) : 0;
  const k = Math.floor(u);
  const f = u - k;
  const dir = k % 2 === 0 ? 1 : -1;
  const reach = 195;
  const bx = dir * mix(-reach, reach, f);
  const by = -230 * 4 * f * (1 - f) + 40;
  const shake = frozen ? Math.min(1, hold * 1.5) * 5 : 0;
  const jx = shake * Math.sin(t * 47);
  const jy = shake * Math.cos(t * 39);
  // Choc : la forme qui vient de renvoyer la balle s'incline un instant
  const hitL = frozen ? 0 : Math.max(0, 1 - ((t - start) % (cross * 2)) / 0.18) * (k % 2 === 0 ? 1 : 0);
  const hitR = frozen ? 0 : Math.max(0, 1 - ((t - start - cross) % (cross * 2)) / 0.18) * (k % 2 === 1 ? 1 : 0);
  const lean = frozen ? Math.min(1, hold * 2) * 6 : 0;
  const paddle = "M 0,-150 C 60,-140 62,140 0,150 C -40,140 -42,-140 0,-150 Z";
  const arc = `M ${-reach},40 Q 0,-420 ${reach},40`;
  const pulse = frozen ? 1 + 0.25 * (0.5 + 0.5 * Math.sin(hold * 7)) : 1;
  const ticks = [0, 1, 2, 3, 4, 5];
  return (
    <g>
      {/* Trajectoire pointillée */}
      <path d={arc} {...ink(pal.fg, 7)} strokeDasharray="2 26" opacity={0.45 * ramp(t, 0.1, 0.4)} />
      {/* Les deux formes */}
      {[
        { x: -275, s: -1, hit: hitL },
        { x: 275, s: 1, hit: hitR },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x}, 40) rotate(${p.s * (12 * p.hit - lean)}) scale(${p.s}, 1)`}>
          <path d={paddle} transform={`translate(${dx * 1.3 * p.s}, ${dy * 1.3})`} fill={pal.shadow} opacity={0.92} />
          <path d={paddle} fill={pal.bg} />
          <path d={paddle} {...ink(pal.fg, 8)} />
        </g>
      ))}
      {/* Balle */}
      <g transform={`translate(${bx + jx}, ${by + jy})`}>
        <circle cx={dx} cy={dy} r={46 * pulse} fill={pal.shadow} opacity={0.92} />
        <circle r={42} fill={pal.bg} />
        <circle r={42} {...ink(pal.fg, 8)} />
      </g>
      {/* Petits traits de tension autour de la balle figée */}
      {frozen
        ? ticks.map((i) => {
            const a = (i / ticks.length) * Math.PI * 2 + 0.3;
            const p = ramp(hold, 0.15 + i * 0.05, 0.3);
            const r1 = 66;
            const r2 = 66 + 34 * p;
            return (
              <path
                key={i}
                d={`M ${bx + Math.cos(a) * r1},${by + Math.sin(a) * r1} L ${bx + Math.cos(a) * r2},${by + Math.sin(a) * r2}`}
                {...ink(pal.fg, 5)}
                opacity={p * (0.6 + 0.4 * Math.sin(hold * 9 + i))}
              />
            );
          })
        : null}
    </g>
  );
};


/**
 * Lien qui s'effiloche : deux ronds reliés par un fil tressé qui se dessine,
 * puis les brins se séparent au milieu, le brin rouge se détend et un « ? » apparaît.
 */
const Fray: React.FC<P> = ({ t }) => {
  const pal = usePalette();
  const { dx, dy } = useRiso();
  const draw = ramp(t, 0.15, 0.6);
  const f = ramp(t, 0.75, 0.9, "inOut");
  const q = ramp(t, 1.3, 0.35);
  const span = 190;
  const strand = (k: number) => {
    const pts: [number, number][] = [];
    for (let x = -span; x <= span; x += 5) {
      const mid = Math.exp(-(x * x) / (2 * 65 * 65));
      const tight = 9 * (1 - 0.7 * mid * f);
      const y =
        tight * Math.sin(x / 15 + (k * Math.PI * 2) / 3 + t * 0.8) +
        (k - 1) * 50 * mid * f +
        (k === 1 ? 28 * mid * f : 0) +
        3 * mid * f * Math.sin(t * 5 + k);
      pts.push([x, y]);
    }
    return toPath(pts);
  };
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw };
  const ends = [-span - 58, span + 58];
  const fibers = [
    { x: -40, y: -42, a: -2.3 },
    { x: 35, y: -46, a: -0.8 },
    { x: -15, y: 62, a: 2.0 },
    { x: 48, y: 58, a: 0.9 },
  ];
  return (
    <g>
      {[0, 2, 1].map((k) => (
        <path key={k} d={strand(k)} {...ink(k === 1 ? pal.shadow : pal.fg, k === 1 ? 10 : 8)} {...dash} />
      ))}
      {fibers.map((b, i) => {
        const p = ramp(t, 0.9 + i * 0.08, 0.5);
        return (
          <path
            key={i}
            d={`M ${b.x},${b.y} l ${Math.cos(b.a) * 18},${Math.sin(b.a) * 18}`}
            transform={`translate(${Math.cos(b.a) * 20 * p}, ${Math.sin(b.a) * 20 * p})`}
            {...ink(pal.fg, 4)}
            opacity={p * 0.6}
          />
        );
      })}
      {ends.map((x, i) => {
        const k = ramp(t, 0.02 + i * 0.1, 0.35);
        return (
          <g key={i} transform={`translate(${x}, 0) scale(${mix(0.6, 1, k)})`} opacity={k}>
            <circle cx={dx * 1.2} cy={dy * 1.2} r={58} fill={pal.shadow} opacity={0.92} />
            <circle r={58} fill={pal.bg} />
            <circle r={58} {...ink(pal.fg, 8)} />
          </g>
        );
      })}
      <g transform={`translate(0, ${mix(-90, -110, q)}) scale(${mix(0.5, 1, q)})`} opacity={q}>
        <path d="M -20,-62 C -20,-100 24,-100 24,-66 C 24,-42 2,-42 2,-18" {...ink(pal.fg, 8)} />
        <circle cx={2} cy={8} r={6} fill={pal.fg} />
      </g>
    </g>
  );
};

export const Motif: React.FC<{ layer: MotifLayer; t: number; d: number }> = ({ layer, t, d }) => {
  const lt = t - (layer.at ?? 0);
  const k = ramp(lt, 0, 0.4);
  const inner =
    layer.kind === "spiral" ? <Spiral t={lt} /> :
    layer.kind === "ripples" ? <Ripples t={lt} /> :
    layer.kind === "waves" ? <Waves t={lt} /> :
    layer.kind === "knot" ? <Knot t={lt} /> :
    layer.kind === "orbit" ? <Orbit t={lt} /> :
    layer.kind === "fray" ? <Fray t={lt} /> :
    layer.kind === "rally" ? <Rally t={lt} d={d - (layer.at ?? 0)} /> :
    <Split t={lt} />;
  return (
    <g transform={`translate(${layer.x}, ${layer.y}) scale(${layer.scale * mix(0.85, 1, k)})`} opacity={k}>
      {inner}
    </g>
  );
};
