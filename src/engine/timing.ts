import { Easing, interpolate } from "remotion";
import type { Shot, TransitionType, VideoData } from "../data/types";
import { expandShots } from "../recipes/recipes";

export const DEFAULT_TRANSITION_SECONDS = 0.35;

export const toFrames = (seconds: number, fps: number) => Math.round(seconds * fps);

/** 0 → 1 entre `start` et `start + duration` (en frames), avec une courbe de Bézier. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  bezier: [number, number, number, number] = [0.16, 1, 0.3, 1],
) =>
  interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...bezier),
  });

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Transitions qui font se chevaucher deux plans. Les autres (cut, slam) sont des coupes franches. */
const OVERLAPPING: TransitionType[] = ["fade", "rise", "slide", "zoom", "wipe"];

export type TimelineEntry = {
  shot: Shot;
  index: number;
  from: number; // frame de début (calée sur la narration)
  duration: number; // durée du plan en frames
  enterFrames: number; // durée de l'entrée
  exitFrames: number; // frames de chevauchement avec le plan suivant
};

/**
 * Timeline des plans. Deux modes, mélangeables :
 *  - durées : les plans sont mis bout à bout ;
 *  - repères audio : un plan avec `startAt` commence à cette seconde de la voix off,
 *    et le plan précédent s'arrête exactement à ce repère.
 */
export const buildTimeline = (shots: Shot[], fps: number): TimelineEntry[] => {
  const starts: number[] = [];
  let cursor = 0;
  shots.forEach((s) => {
    const start = s.startAt ?? cursor;
    starts.push(start);
    cursor = start + s.duration;
  });
  const enterOf = (s?: Shot) => {
    if (!s?.enter || s.enter.type === "cut") return 0;
    return toFrames(s.enter.duration ?? DEFAULT_TRANSITION_SECONDS, fps);
  };
  return shots.map((shot, index) => {
    const from = toFrames(starts[index], fps);
    const next = shots[index + 1];
    const end = next?.startAt !== undefined ? toFrames(next.startAt, fps) : toFrames(starts[index] + shot.duration, fps);
    return {
      shot,
      index,
      from,
      duration: Math.max(1, end - from),
      enterFrames: index === 0 ? 0 : enterOf(shot),
      exitFrames: next?.enter && OVERLAPPING.includes(next.enter.type) ? enterOf(next) : 0,
    };
  });
};

export const DEFAULT_FPS = 30;

/** Pour <Composition calculateMetadata> : la durée se recalcule quand on change les plans dans le Studio. */
export const calculateVideoMetadata = ({ props }: { props: VideoData }) => {
  if (props.planche) {
    const { width, height } = plancheSize(props.shots.length);
    return { durationInFrames: 1, fps: DEFAULT_FPS, width, height };
  }
  return { durationInFrames: totalDurationInFrames(props, DEFAULT_FPS), fps: DEFAULT_FPS, width: 1080, height: 1920 };
};

/** Dimensions de la planche contact : 7 vignettes par ligne. */
export const PLANCHE = { columns: 7, scale: 0.25, gap: 14, label: 44 };
export const plancheSize = (count: number) => {
  const cw = 1080 * PLANCHE.scale;
  const ch = 1920 * PLANCHE.scale;
  const rows = Math.ceil(count / PLANCHE.columns);
  const w = PLANCHE.columns * cw + (PLANCHE.columns + 1) * PLANCHE.gap;
  const h = rows * (ch + PLANCHE.label) + (rows + 1) * PLANCHE.gap;
  return { width: Math.round(w / 2) * 2, height: Math.round(h / 2) * 2 };
};

export const totalDurationInFrames = (video: VideoData, fps: number) => {
  const tl = buildTimeline(expandShots(video.shots), fps);
  const last = tl[tl.length - 1];
  return last.from + last.duration;
};
