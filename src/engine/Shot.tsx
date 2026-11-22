import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { renderLayer } from "../components/layers/registry";
import { envelope, mix, ramp } from "../components/layers/anim";
import { KineticText } from "../components/text/KineticText";
import type { Shot as ShotData } from "../data/types";
import { PaletteProvider, useTheme } from "../theme/ThemeContext";

/** Un plan : fond plein, calques visuels sous la caméra (avec ombre dure), puis texte cinétique. */
export const Shot: React.FC<{ shot: ShotData; durationInFrames: number; frameOverride?: number }> = ({
  shot,
  durationInFrames,
  frameOverride,
}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current; // la planche contact fige chaque plan sur une image
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const pal = theme.palettes[shot.bg];
  const t = frame / fps;
  const d = durationInFrames / fps;

  // Caméra : poussée lente permanente + coups de zoom éventuels
  const cam = shot.camera ?? {};
  const k = ramp(t, 0, d, "inOut");
  const [z0, z1] = cam.zoom ?? [1, 1.07];
  const punch = Math.max(0, ...(cam.punch ?? []).map((p) => envelope(t, p, 0.05, 0.06, 0.3)));
  const zoom = mix(z0, z1, k) * (1 + 0.06 * punch);
  const px = cam.x ? mix(cam.x[0], cam.x[1], k) : 0;
  const py = cam.y ? mix(cam.y[0], cam.y[1], k) : 0;
  const rot = cam.rotate ? mix(cam.rotate[0], cam.rotate[1], k) : 0;
  const { width: W, height: H } = theme.layout;

  const filterId = `shadow-${shot.id}`;
  const useShadow = shot.shadow !== false && (theme.shadow.dx !== 0 || theme.shadow.dy !== 0);
  const texts = shot.text ? (Array.isArray(shot.text) ? shot.text : [shot.text]) : [];

  return (
    <PaletteProvider palette={pal}>
      <AbsoluteFill style={{ backgroundColor: pal.bg }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <defs>
            {/* Ombre portée dure : silhouette décalée, sans flou */}
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feFlood floodColor={pal.shadow} result="c" />
              <feComposite in="c" in2="SourceAlpha" operator="in" result="s" />
              <feOffset in="s" dx={theme.shadow.dx} dy={theme.shadow.dy} result="o" />
              <feMerge>
                <feMergeNode in="o" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g
            transform={`translate(${W / 2 + px}, ${H / 2 + py}) rotate(${rot}) scale(${zoom}) translate(${-W / 2}, ${-H / 2})`}
          >
            {shot.layers.map((layer, i) => (
              <g key={i} filter={useShadow && layer.type !== "shape" && layer.type !== "timeline" ? `url(#${filterId})` : undefined}>
                {renderLayer(layer, t, d, `${shot.id}-${i}`)}
              </g>
            ))}
          </g>
        </svg>
        {texts.map((item, i) => (
          <KineticText key={i} item={item} t={t} d={d} />
        ))}
      </AbsoluteFill>
    </PaletteProvider>
  );
};
