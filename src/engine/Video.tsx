import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { VideoData } from "../data/types";
import { styleToTheme } from "../theme/theme";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";
import { Shot } from "./Shot";
import { expandShots } from "../recipes/recipes";
import type { Shot as ShotData } from "../data/types";
import { buildTimeline, PLANCHE, progress, TimelineEntry, toFrames } from "./timing";
import { TRANSITIONS } from "./transitions";

/** Applique l'entrée d'un plan et la sortie qu'il subit pendant l'entrée du suivant. */
const ShotFrame: React.FC<{ entry: TimelineEntry; next?: TimelineEntry; children: React.ReactNode }> = ({ entry, next, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const theme = useTheme();
  const enterType = entry.shot.enter?.type ?? "cut";
  const exitType = next?.shot.enter?.type ?? "cut";
  const pIn = entry.enterFrames > 0 ? progress(frame, 0, entry.enterFrames, theme.motion.enter) : 1;
  const pOut = entry.exitFrames > 0 ? progress(frame, entry.duration, entry.exitFrames, theme.motion.inOut) : 0;
  const a = TRANSITIONS[enterType].enter(pIn, { width, height });
  const b = pOut > 0 ? TRANSITIONS[exitType].exit(pOut, { width, height }) : {};
  const transform = [a.transform, b.transform].filter(Boolean).join(" ") || undefined;
  return (
    <AbsoluteFill style={{ ...a, ...b, transform }}>
      {children}
      {enterType === "wipe" && pIn < 1 ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${pIn * 100}% - 10px)`, width: 10, background: theme.palettes.cream.accent }} />
      ) : null}
    </AbsoluteFill>
  );
};

/** Éléments persistants : barre de progression et titre de série, colorés selon le plan en cours. */
const Chrome: React.FC<{ video: VideoData; timeline: TimelineEntry[] }> = ({ video, timeline }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const theme = useTheme();
  const current = [...timeline].reverse().find((e) => frame >= e.from) ?? timeline[0];
  const pal = theme.palettes[current.shot.bg];
  const { marginX, safeTop } = theme.layout;
  return (
    <AbsoluteFill>
      {video.style.progressBar ? (
        <div style={{ position: "absolute", top: safeTop, left: marginX, right: marginX, height: 5, background: pal.muted }}>
          <div style={{ height: "100%", width: `${(frame / (durationInFrames - 1)) * 100}%`, background: pal.fg }} />
        </div>
      ) : null}
      {video.style.series ? (
        <div style={{ position: "absolute", top: safeTop + 24, left: marginX, fontFamily: theme.font.family, fontSize: 32, fontWeight: 500, color: pal.fg, opacity: 0.7 }}>
          {video.style.series}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Texture papier par-dessus tout (image fixe, donc identique à chaque rendu). */
const Grain: React.FC = () => {
  const theme = useTheme();
  if (!theme.grain.opacity) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: theme.grain.opacity, pointerEvents: "none" }}>
      <Img src={staticFile("grain.png")} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
    </AbsoluteFill>
  );
};

/** Planche contact : chaque plan figé à 70 % de sa durée, numéroté. Pour valider un montage sur une seule image. */
const Planche: React.FC<{ shots: ShotData[] }> = ({ shots }) => {
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const cw = 1080 * PLANCHE.scale;
  const ch = 1920 * PLANCHE.scale;
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      {shots.map((shot, i) => {
        const col = i % PLANCHE.columns;
        const row = Math.floor(i / PLANCHE.columns);
        const x = PLANCHE.gap + col * (cw + PLANCHE.gap);
        const y = PLANCHE.gap + row * (ch + PLANCHE.label + PLANCHE.gap);
        const frames = toFrames(shot.duration, fps);
        return (
          <div key={shot.id} style={{ position: "absolute", left: x, top: y, width: cw, height: ch + PLANCHE.label, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${PLANCHE.scale})`, transformOrigin: "0 0", overflow: "hidden" }}>
              <Shot shot={shot} durationInFrames={frames} frameOverride={Math.round(frames * 0.7)} />
            </div>
            <div style={{ position: "absolute", left: 0, top: ch + 8, width: cw, fontFamily: theme.font.family, fontSize: 22, fontWeight: 600, color: "#141210", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {i + 1} · {shot.id.replace(/^\d+-/, "")} · {shot.duration}s
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Volume des effets sonores : discrets, sous la voix. */
const SFX_VOLUME = 0.22;

/** Composition principale. Ses props sont les données de la vidéo (voir src/data/schema.ts). */
export const Video: React.FC<VideoData> = (video) => {
  const { fps } = useVideoConfig();
  const theme = styleToTheme(video.style);
  const shots = expandShots(video.shots);
  if (video.planche) {
    return (
      <ThemeProvider theme={theme}>
        <Planche shots={shots} />
      </ThemeProvider>
    );
  }
  const timeline = buildTimeline(shots, fps);
  if (timeline.length === 0) {
    return <AbsoluteFill style={{ backgroundColor: theme.palettes.cream.bg }} />;
  }
  return (
    <ThemeProvider theme={theme}>
      <AbsoluteFill style={{ backgroundColor: theme.palettes.cream.bg }}>
        {timeline.map((entry) => (
          <Sequence
            key={entry.shot.id}
            name={entry.shot.id}
            from={entry.from}
            durationInFrames={entry.duration + entry.exitFrames}
          >
            <ShotFrame entry={entry} next={timeline[entry.index + 1]}>
              <Shot shot={entry.shot} durationInFrames={entry.duration + entry.exitFrames} />
            </ShotFrame>
            {entry.shot.sfx ? <Audio src={staticFile(`sfx/${entry.shot.sfx}.wav`)} volume={SFX_VOLUME} /> : null}
          </Sequence>
        ))}
        <Chrome video={video} timeline={timeline} />
        <Grain />
        {video.audio ? (
          <Sequence from={toFrames(video.audio.offset ?? 0, fps)}>
            <Audio src={staticFile(video.audio.src)} volume={video.audio.volume ?? 1} />
          </Sequence>
        ) : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
