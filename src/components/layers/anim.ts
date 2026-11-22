import { Easing, interpolate } from "remotion";

/** Petits outils d'animation en secondes, purement fonction du temps (donc déterministes). */
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 entre `start` et `start + dur`. */
export const ramp = (t: number, start: number, dur: number, curve: "out" | "inOut" | "linear" = "out") =>
  interpolate(t, [start, start + Math.max(0.001, dur)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: curve === "out" ? ease : curve === "inOut" ? inOut : (x) => x,
  });

/** Enveloppe 0 → 1 → 0. */
export const envelope = (t: number, at: number, hold: number, rise = 0.2, fall = 0.3) =>
  ramp(t, at, rise) * (1 - ramp(t, at + hold, fall, "inOut"));

/** Ressort amorti 0 → 1 avec léger dépassement. */
export const springy = (t: number, at: number, dur = 0.5) => {
  const x = Math.min(1, Math.max(0, (t - at) / dur));
  if (x <= 0) return 0;
  return 1 - Math.cos(x * Math.PI * 2.5) * Math.exp(-x * 5.5);
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
