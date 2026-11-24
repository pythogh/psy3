import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { renderLayer } from "../components/layers/registry";
import { envelope, mix, ramp } from "../components/layers/anim";
import { KineticText } from "../components/text/KineticText";
import type { Shot as ShotData } from "../data/types";
import { PaletteProvider, useTheme } from "../theme/ThemeContext";

/**
 * Un plan : fond plein, calques visuels sous la caméra (avec ombre dure), puis texte cinétique.
 * Mode risographie (style.riso) : traits légèrement tremblés, et ombre transformée en couche
 * de couleur décalée, piquée de petits manques d'encre, sur un papier tramé de points.
 */
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

  // Risographie
  const riso = theme.riso ?? { wobble: 0, boil: false, speckle: false };
  const wobble = riso.wobble ?? 0;
  // Frémissement : le motif du tremblé change environ 8 fois par seconde
  const seed = riso.boil ? (Math.floor(frame / Math.max(1, Math.round(fps / 8))) % 4) + 1 : 1;

  const filterId = `shadow-${shot.id}`;
  const wobbleId = `wobble-${shot.id}`;
  const dotsId = `dots-${shot.id}`;
  const useShadow = shot.shadow !== false && (theme.shadow.dx !== 0 || theme.shadow.dy !== 0);
  const texts = shot.text ? (Array.isArray(shot.text) ? shot.text : [shot.text]) : [];
  // La mascotte dessine déjà sa propre couche décalée : pas d'ombre ni de tremblé en plus
  const noShadow = (type: string) => type === "shape" || type === "timeline" || type === "mascot";

  const risoOn = wobble > 0 || riso.speckle;
  const risoId = `riso-${shot.id}`;

  const filterFor = (type: string): string | undefined => {
    if (type === "mascot") return undefined;
    if (risoOn) return `url(#${risoId})`;
    if (useShadow && !noShadow(type)) return `url(#${filterId})`;
    if (wobble > 0) return `url(#${wobbleId})`;
    return undefined;
  };

  return (
    <PaletteProvider palette={pal}>
      <AbsoluteFill style={{ backgroundColor: pal.bg }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          <defs>
            {/* Ombre portée dure (ou couche riso) : silhouette décalée, sans flou */}
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              {wobble > 0 ? (
                <>
                  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={seed} result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={wobble} xChannelSelector="R" yChannelSelector="G" result="g" />
                </>
              ) : (
                <feOffset in="SourceGraphic" dx={0} dy={0} result="g" />
              )}
              <feFlood floodColor={pal.shadow} result="c" />
              <feComposite in="c" in2="g" operator="in" result="s" />
              <feOffset in="s" dx={theme.shadow.dx} dy={theme.shadow.dy} result="o" />
              {riso.speckle ? (
                <>
                  {/* Manques d'encre : petits trous irréguliers dans la couche décalée */}
                  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={7} result="grain" />
                  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 4.6" result="holes" />
                  <feComposite in="o" in2="holes" operator="in" result="o2" />
                </>
              ) : (
                <feOffset in="o" dx={0} dy={0} result="o2" />
              )}
              <feMerge>
                <feMergeNode in="o2" />
                <feMergeNode in="g" />
              </feMerge>
            </filter>
            {/* Papier imprimé : trame de petits points, dans la couleur du texte */}
            <pattern id={dotsId} width={27} height={27} patternUnits="userSpaceOnUse">
              <circle cx={6} cy={8} r={2.2} fill={pal.fg} opacity={0.1} />
              <circle cx={19.5} cy={21} r={1.7} fill={pal.fg} opacity={0.08} />
              <circle cx={21} cy={4.5} r={1.4} fill={pal.fg} opacity={0.06} />
            </pattern>
            {/* Risographie : trait tremblé et petits manques d'encre sur tout le visuel */}
            <filter id={risoId} x="-10%" y="-10%" width="120%" height="120%">
              {wobble > 0 ? (
                <>
                  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={seed} result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale={wobble} xChannelSelector="R" yChannelSelector="G" result="g" />
                </>
              ) : (
                <feOffset in="SourceGraphic" dx={0} dy={0} result="g" />
              )}
              {riso.speckle ? (
                <>
                  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={1} seed={7} result="grain" />
                  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 4.6" result="holes" />
                  <feComposite in="g" in2="holes" operator="in" />
                </>
              ) : (
                <feOffset in="g" dx={0} dy={0} />
              )}
            </filter>
            {/* Tremblé seul, pour les calques sans ombre (formes de décor, plans shadow: false) */}
            <filter id={wobbleId} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={seed} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={wobble} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          {riso.speckle ? <rect x={0} y={0} width={W} height={H} fill={`url(#${dotsId})`} /> : null}
          <g
            transform={`translate(${W / 2 + px}, ${H / 2 + py}) rotate(${rot}) scale(${zoom}) translate(${-W / 2}, ${-H / 2})`}
          >
            {shot.layers.map((layer, i) => (
              <g key={i} filter={filterFor(layer.type)}>
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
