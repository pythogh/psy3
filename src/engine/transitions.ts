import type React from "react";
import type { TransitionType } from "../data/types";

/**
 * enter(p) : style du plan qui entre (p : 0 → 1).
 * exit(p)  : style du plan qui sort pendant ce temps (même type que le plan suivant).
 * Pour "cut" et "slam", il n'y a pas de chevauchement : la coupe est franche.
 */
type StyleFn = (p: number, size: { width: number; height: number }) => React.CSSProperties;

export const TRANSITIONS: Record<TransitionType, { enter: StyleFn; exit: StyleFn }> = {
  cut: { enter: () => ({}), exit: () => ({}) },
  // Coupe franche avec un léger recul d'échelle : donne de l'impact
  slam: { enter: (p) => ({ transform: `scale(${1.14 - 0.14 * p})` }), exit: () => ({}) },
  fade: { enter: (p) => ({ opacity: p }), exit: () => ({}) },
  rise: { enter: (p, s) => ({ transform: `translateY(${(1 - p) * s.height}px)` }), exit: (p) => ({ transform: `translateY(${-p * 300}px)` }) },
  slide: { enter: (p, s) => ({ transform: `translateX(${(1 - p) * s.width}px)` }), exit: (p) => ({ transform: `translateX(${-p * 360}px)` }) },
  zoom: { enter: (p) => ({ opacity: p, transform: `scale(${0.85 + 0.15 * p})` }), exit: (p) => ({ transform: `scale(${1 + 0.15 * p})` }) },
  wipe: { enter: (p) => ({ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }), exit: () => ({}) },
};
