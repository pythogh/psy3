import React, { useMemo } from "react";
import { random } from "remotion";
import type { CounterLayer, DotLayer, GroundLayer, PatternLayer, ShapeLayer, TimelineLayer } from "../../data/types";
import { usePalette, useTheme } from "../../theme/ThemeContext";
import { ContextShape, CONTEXT_HEIGHT } from "../svg/Contexts";
import { Phone, PHONE_H } from "../svg/Phone";
import { envelope, mix, ramp, springy } from "./anim";

type P<L> = { layer: L; t: number; d: number };

/** Grille de cases : remplissage régulier (apprentissage) ou flashs imprévisibles (intermittence). */
export const Pattern: React.FC<P<PatternLayer>> = ({ layer, t }) => {
  const pal = usePalette();
  const n = layer.columns * layer.rows;
  const totalW = layer.columns * layer.size + (layer.columns - 1) * layer.gap;
  const totalH = layer.rows * layer.size + (layer.rows - 1) * layer.gap;
  const x0 = 540 - totalW / 2;
  const y0 = layer.y - totalH / 2;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const cx = x0 + (i % layer.columns) * (layer.size + layer.gap);
        const cy = y0 + Math.floor(i / layer.columns) * (layer.size + layer.gap);
        let fill = 0;
        let reward = false;
        if (layer.mode === "sequence") {
          fill = ramp(t, 0.1 + i * 0.07, 0.15);
        } else {
          // Chaque case flashe à des instants pseudo-aléatoires stables (graine)
          const period = 0.9 + random(`${layer.seed}-p-${i}`) * 1.6;
          const phase = random(`${layer.seed}-o-${i}`) * period;
          const local = (t + phase) % period;
          fill = envelope(local, 0, 0.16, 0.04, 0.14);
          const cycle = Math.floor((t + phase) / period);
          reward = random(`${layer.seed}-r-${i}-${cycle}`) < (layer.rewardRate ?? 0);
        }
        const color = reward ? pal.accent : pal.fg;
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={layer.size} height={layer.size} fill="none" stroke={pal.muted} strokeWidth={3} />
            <rect
              x={cx + (layer.size * (1 - fill)) / 2}
              y={cy + (layer.size * (1 - fill)) / 2}
              width={layer.size * fill}
              height={layer.size * fill}
              fill={color}
            />
          </g>
        );
      })}
    </g>
  );
};

/** Grand compteur qui défile, entouré d'un arc de progression. */
export const Counter: React.FC<P<CounterLayer>> = ({ layer, t }) => {
  const pal = usePalette();
  const theme = useTheme();
  const k = ramp(t, 0.05, layer.duration, "inOut");
  const value = Math.round(mix(layer.from, layer.to, k));
  const r = layer.radius;
  const c = 2 * Math.PI * r;
  return (
    <g transform={`translate(${layer.x}, ${layer.y})`}>
      <circle r={r} fill="none" stroke={pal.muted} strokeWidth={14} />
      <circle
        r={r}
        fill="none"
        stroke={pal.fg}
        strokeWidth={14}
        strokeDasharray={`${c * k} ${c}`}
        transform="rotate(-90)"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={theme.font.family}
        fontWeight={800}
        fontSize={r * 0.78}
        letterSpacing="-0.04em"
        fill={pal.fg}
      >
        {value}
        {layer.suffix ?? ""}
      </text>
    </g>
  );
};

/** Point plein, contour pointillé, ou point qui se vide ; pulsation et onde d'écho. */
export const Dot: React.FC<P<DotLayer>> = ({ layer, t }) => {
  const pal = usePalette();
  const empty =
    layer.mode === "empty" ? 1 : layer.mode === "fill" ? 0 : ramp(t, layer.emptyAt ?? 0.6, 0.6, "inOut");
  const appear = Math.max(0, springy(t, 0, 0.6));
  const period = 1.1;
  const phase = (t % period) / period;
  const breathe = 1 + 0.05 * Math.sin(phase * Math.PI * 2);
  const r = layer.radius;
  const dash = (2 * Math.PI * r) / 36;
  return (
    <g transform={`translate(${layer.x}, ${layer.y})`}>
      {layer.echo ? (
        <circle r={r * (1 + phase * 0.8)} fill="none" stroke={pal.accent} strokeWidth={4} opacity={(1 - phase) * 0.7} />
      ) : null}
      <g transform={`scale(${appear * breathe}) rotate(${t * 20})`}>
        <circle r={r} fill={pal.accent} opacity={1 - empty} />
        <circle
          r={r}
          fill="none"
          stroke={pal.accent}
          strokeWidth={12}
          strokeDasharray={`${dash * 0.55} ${dash * 0.45}`}
          opacity={empty}
        />
      </g>
    </g>
  );
};

/** Grande forme géométrique, souvent coupée par le cadre : contraste d'échelle et profondeur. */
export const Shape: React.FC<P<ShapeLayer>> = ({ layer, t }) => {
  const pal = usePalette();
  const color = pal[layer.color ?? "accent"];
  const appear = ramp(t, 0, 0.45);
  const s = layer.size * mix(0.85, 1, appear);
  const rot = (layer.spin ?? 0) * t;
  let el: React.ReactNode;
  if (layer.shape === "circle") el = <circle r={s / 2} fill={color} />;
  else if (layer.shape === "square") el = <rect x={-s / 2} y={-s / 2} width={s} height={s} fill={color} />;
  else {
    const dash = (Math.PI * s) / 40;
    el = (
      <circle
        r={s / 2}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(10, s * 0.025)}
        strokeDasharray={layer.shape === "dashedRing" ? `${dash * 0.55} ${dash * 0.45}` : undefined}
      />
    );
  }
  return <g transform={`translate(${layer.x}, ${layer.y}) rotate(${rot})`} opacity={appear}>{el}</g>;
};

/** Ligne de sol : le décor puis le téléphone en surgissent. */
export const Ground: React.FC<P<GroundLayer> & { clipId: string }> = ({ layer, t, clipId }) => {
  const pal = usePalette();
  const g = layer.y;
  const ctx = layer.context;
  const ph = layer.phone;
  const rise = ctx ? ramp(t, ctx.at ?? 0, 0.35) : 0;
  const up = ph ? Math.max(0, ...ph.pops.map((p) => envelope(t, p.at, p.hold, 0.16, 0.24))) : 0;
  const phH = ph ? PHONE_H * ph.scale : 0;
  const propY = mix(g + phH / 2 + 10, g - phH / 2 - 30, up);
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={-2000} y={-2000} width={5000} height={2000 + g} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {ctx ? (
          <g transform={`translate(${ctx.x}, ${g + (1 - rise) * (CONTEXT_HEIGHT[ctx.kind] + 60)})`}>
            <ContextShape kind={ctx.kind} t={Math.max(0, t - (ctx.at ?? 0))} />
          </g>
        ) : null}
        {ph ? (
          <g transform={`translate(${ph.x}, ${propY}) scale(${ph.scale})`}>
            <Phone screen={up > 0.8 ? (up - 0.8) / 0.2 : 0} />
          </g>
        ) : null}
      </g>
      <rect x={-200} y={g - 3} width={1480} height={6} fill={pal.fg} />
    </g>
  );
};

/** Journée en une ligne : nombreux segments courts, quelques sessions longues, curseur de balayage. */
export const Timeline: React.FC<P<TimelineLayer>> = ({ layer, t, d }) => {
  const pal = usePalette();
  const theme = useTheme();
  const x1 = theme.layout.marginX;
  const x2 = theme.layout.width - theme.layout.marginX;
  const y = layer.y;
  const bars = useMemo(
    () =>
      Array.from({ length: layer.count }, (_, i) => ({
        at: random(`${layer.seed}-x-${i}`),
        h: 46 + random(`${layer.seed}-h-${i}`) * 110,
      })),
    [layer.count, layer.seed],
  );
  const cursor = mix(layer.sweep[0], layer.sweep[1], ramp(t, 0, d, "linear"));
  const grow = (pos: number) => Math.min(1, Math.max(0, (cursor - pos) * 40));
  return (
    <g>
      <rect x={x1} y={y - 2} width={x2 - x1} height={5} fill={pal.fg} />
      <text x={x1} y={y + 64} fontFamily={theme.font.family} fontSize={34} fontWeight={500} fill={pal.muted}>
        {layer.startLabel}
      </text>
      <text x={x2} y={y + 64} textAnchor="end" fontFamily={theme.font.family} fontSize={34} fontWeight={500} fill={pal.muted}>
        {layer.endLabel}
      </text>
      {layer.longSessions.map((s, i) => (
        <rect key={i} x={mix(x1, x2, s.at)} y={y + 10} width={(x2 - x1) * s.length * grow(s.at)} height={28} fill={pal.fg} />
      ))}
      {bars.map((b, i) => {
        const g = grow(b.at);
        if (g <= 0) return null;
        return <rect key={i} x={mix(x1, x2, b.at) - 3} y={y - 4 - b.h * g} width={7} height={b.h * g} fill={pal.accent} />;
      })}
      {cursor > 0 && cursor < 1 ? (
        <rect x={mix(x1, x2, cursor) - 1.5} y={y - 220} width={3} height={270} fill={pal.fg} />
      ) : null}
    </g>
  );
};
