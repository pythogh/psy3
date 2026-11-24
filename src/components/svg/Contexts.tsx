import React from "react";
import type { ContextKind } from "../../data/types";
import { usePalette } from "../../theme/ThemeContext";
import { useRiso } from "../riso";

/** Décors de contexte posés sur y = 0 (le sol), centrés en x = 0. `t` : secondes depuis l'apparition. */
export const CONTEXT_HEIGHT: Record<ContextKind, number> = { elevator: 470, queue: 280, hourglass: 330 };

const Elevator: React.FC<{ t: number }> = ({ t }) => {
  const pal = usePalette();
  const riso = useRiso();
  const open = Math.min(1, Math.max(0, (t - 0.3) / 0.6)) * 26; // les portes s'entrouvrent
  const blink = Math.floor(t * 3) % 2 === 0 ? 1 : 0.35;
  if (riso.on) {
    // Cabine en trait d'encre, portes avec couche de couleur décalée, voyant cerclé
    const dx = riso.dx * 1.4;
    const dy = riso.dy * 1.4;
    return (
      <g>
        <rect x={-124 - open + dx} y={-384 + dy} width={120} height={384} rx={6} fill={pal.shadow} opacity={0.92} />
        <rect x={4 + open + dx} y={-384 + dy} width={120} height={384} rx={6} fill={pal.shadow} opacity={0.92} />
        <rect x={-140} y={-400} width={280} height={400} rx={8} fill="none" stroke={pal.fg} strokeWidth={9} strokeLinejoin="round" />
        <rect x={-124 - open} y={-384} width={120} height={384} rx={6} fill="none" stroke={pal.fg} strokeWidth={7} />
        <rect x={4 + open} y={-384} width={120} height={384} rx={6} fill="none" stroke={pal.fg} strokeWidth={7} />
        <circle cx={0} cy={-440} r={22} fill={pal.accent} opacity={blink} />
        <circle cx={0} cy={-440} r={22} fill="none" stroke={pal.fg} strokeWidth={6} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-140} y={-400} width={280} height={400} fill="none" stroke={pal.fg} strokeWidth={10} />
      <rect x={-124 - open} y={-384} width={120} height={384} fill={pal.fg} />
      <rect x={4 + open} y={-384} width={120} height={384} fill={pal.fg} />
      <circle cx={0} cy={-440} r={22} fill={pal.accent} opacity={blink} />
    </g>
  );
};

const Queue: React.FC<{ t: number }> = ({ t }) => {
  const pal = usePalette();
  const riso = useRiso();
  const people = [-150, -50, 50, 150];
  return (
    <g>
      {people.map((x, i) => {
        const sway = Math.sin(t * 2.4 + i * 1.3) * 4; // petits mouvements d'attente
        const last = i === people.length - 1;
        if (riso.on) {
          // Silhouettes en trait d'encre ; la dernière (toi) a la couche de couleur décalée
          const dx = riso.dx * 1.2;
          const dy = riso.dy * 1.2;
          return (
            <g key={i} transform={`translate(${x + sway}, 0)`}>
              {last ? (
                <g fill={pal.shadow} opacity={0.92}>
                  <rect x={-34 + dx} y={-200 + dy} width={68} height={200} rx={34} />
                  <circle cx={dx} cy={-244 + dy} r={30} />
                </g>
              ) : null}
              <g fill="none" stroke={last ? pal.fg : pal.muted} strokeWidth={7}>
                <rect x={-34} y={-200} width={68} height={200} rx={34} />
                <circle cx={0} cy={-244} r={30} />
              </g>
            </g>
          );
        }
        const color = last ? pal.fg : pal.muted;
        return (
          <g key={i} transform={`translate(${x + sway}, 0)`}>
            <rect x={-34} y={-200} width={68} height={200} rx={34} fill={color} />
            <circle cx={0} cy={-244} r={30} fill={color} />
          </g>
        );
      })}
    </g>
  );
};

const Hourglass: React.FC<{ t: number }> = ({ t }) => {
  const pal = usePalette();
  const flow = Math.min(1, t / 2.5);
  const topH = 110 * (1 - flow);
  const botH = 110 * flow;
  return (
    <g>
      <rect x={-110} y={-330} width={220} height={16} fill={pal.fg} />
      <rect x={-110} y={-16} width={220} height={16} fill={pal.fg} />
      <path d="M -90 -314 L 90 -314 L 8 -165 L -8 -165 Z" fill="none" stroke={pal.fg} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -8 -165 L 8 -165 L 90 -16 L -90 -16 Z" fill="none" stroke={pal.fg} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M ${-topH * 0.6} ${-165 - topH} L ${topH * 0.6} ${-165 - topH} L 0 -170 Z`} fill={pal.accent} />
      <path d={`M 0 ${-22 - botH} L ${botH * 0.62} -22 L ${-botH * 0.62} -22 Z`} fill={pal.accent} />
      {flow < 1 ? <rect x={-2} y={-170} width={4} height={148 - botH} fill={pal.accent} /> : null}
    </g>
  );
};

export const ContextShape: React.FC<{ kind: ContextKind; t: number }> = ({ kind, t }) => {
  if (kind === "elevator") return <Elevator t={t} />;
  if (kind === "queue") return <Queue t={t} />;
  return <Hourglass t={t} />;
};
