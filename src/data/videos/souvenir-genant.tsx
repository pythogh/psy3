import React from "react";
import { Composition } from "remotion";
import { videoSchema } from "../schema";
import { Video } from "../../engine/Video";
import { calculateVideoMetadata, DEFAULT_FPS } from "../../engine/timing";

export const SouvenirGenantComposition: React.FC = () => (
  <Composition
    id="souvenir-genant"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi ce souvenir gênant revient toujours la nuit\u00A0?",
      style: {
        palettes: {
          cream: { bg: "#F3ECE0", fg: "#1C1A19", accent: "#E0485A", muted: "#A8A094", shadow: "#E0485A", screen: "#2A2622" },
          ink: { bg: "#1C1A19", fg: "#F3ECE0", accent: "#E0485A", muted: "#5E5850", shadow: "#E0485A", screen: "#2A2622" },
          accent: { bg: "#8FAE97", fg: "#1C1A19", accent: "#E0485A", muted: "#6F9179", shadow: "#E0485A", screen: "#2A2622" },
        },
        textSizes: { giant: 230, hook: 118, title: 88, body: 60, note: 34 },
        shadow: { dx: 8, dy: 7 },
        grain: 0.2,
        progressBar: false,
        riso: { wobble: 4, boil: true, speckle: true },
        series: "",
      },
      script: [
        "Tu rougis encore d’une gêne vieille de dix ans, à trois heures du matin\u00A0? Une phrase ratée, un «\u00A0toi aussi\u00A0» lancé au serveur… et la chaleur te remonte au visage, dans le noir.",
        "La nuit, ton cerveau n’a plus rien à traiter. Pas d’écran, pas de bruit. Alors il vagabonde, souvent vers ce qui te concerne. Et la fatigue rend les émotions plus dures à apaiser.",
        "Or la gêne est une émotion sociale. Elle a touché ton image aux yeux des autres, donc ta mémoire l’a gardée. Pas seulement la scène… la sensation aussi.",
        "Pourtant, essaie de te rappeler la dernière gêne d’un ami. Tu ne t’en souviens pas, n’est-ce pas\u00A0? Pour les autres, c’est pareil… ce moment qui t’empêche de dormir, ils l’ont sans doute oublié.",
        "Alors, la prochaine fois qu’il revient à trois heures du matin, demande-toi… ce souvenir parle-t-il de ce que tu as fait, ou de ce que tu crains qu’on pense de toi\u00A0?",
      ],
      shots: [
        /* 1 */ { recipe: "scene", bg: "ink", duration: 3.3, text: "Tu rougis encore | d’une gêne vieille | de dix ans\u00A0?", textStyle: "hook", kind: "memory", camera: "push" },
        /* 2 */ { recipe: "motif", bg: "cream", duration: 2.1, enter: "slam", text: "À trois heures | du matin\u00A0?", kind: "ripples" },
        /* 3 */ { recipe: "words", bg: "ink", duration: 1.3, enter: "slam", text: "Une phrase | ratée.", decor: "none" },
        /* 4 */ { recipe: "words", bg: "accent", duration: 2.1, enter: "slam", text: "Un «\u00A0toi aussi\u00A0» | au serveur…", decor: "none" },
        /* 5 */ { recipe: "scene", bg: "cream", duration: 2.5, enter: "slam", text: "La chaleur | te remonte | au visage.", kind: "blush" },
        /* 6 */ { recipe: "scene", bg: "ink", duration: 1.3, enter: "fade", text: "Dans le noir.", kind: "night", camera: "still" },
        /* 7 */ { recipe: "words", bg: "accent", duration: 1.7, enter: "wipe", text: "La nuit, | ton cerveau…", decor: "none" },
        /* 8 */ { recipe: "words", bg: "cream", duration: 2.1, text: "n’a plus rien | à traiter.", decor: "none" },
        /* 9 */ { recipe: "phone", bg: "ink", duration: 0.9, enter: "slam", text: "Pas d’écran,", screen: "off", motion: "drop" },
        /* 10 */ { recipe: "words", bg: "cream", duration: 1.3, enter: "slam", text: "pas de bruit.", decor: "none" },
        /* 11 */ { recipe: "motif", bg: "accent", duration: 1.3, enter: "zoom", text: "Alors | il vagabonde,", kind: "knot" },
        /* 12 */ { recipe: "motif", bg: "ink", duration: 2.1, text: "vers ce qui | te concerne.", kind: "spiral", camera: "push" },
        /* 13 */ { recipe: "words", bg: "cream", duration: 1.3, enter: "slam", text: "Et la fatigue…", decor: "none" },
        /* 14 */ { recipe: "motif", bg: "accent", duration: 2.9, text: "rend les émotions | plus dures | à apaiser.", kind: "waves" },
        /* 15 */ { recipe: "words", bg: "ink", duration: 2.5, enter: "rise", text: "La gêne est | une émotion sociale.", textStyle: "term", decor: "none" },
        /* 16 */ { recipe: "motif", bg: "cream", duration: 2.5, text: "Ton image | aux yeux des autres.", kind: "orbit" },
        /* 17 */ { recipe: "words", bg: "accent", duration: 1.7, enter: "slam", text: "Ta mémoire | l’a gardée.", decor: "none" },
        /* 18 */ { recipe: "words", bg: "ink", duration: 1.7, enter: "slam", text: "Pas seulement | la scène…", decor: "none" },
        /* 19 */ { recipe: "motif", bg: "cream", duration: 1.3, text: "la sensation | aussi.", kind: "split" },
        /* 20 */ { recipe: "words", bg: "accent", duration: 2.9, enter: "slide", text: "Essaie de te rappeler | la gêne d’un ami.", decor: "none" },
        /* 21 */ { recipe: "motif", bg: "ink", duration: 2.1, text: "Tu ne t’en | souviens pas\u00A0?", kind: "ripples", camera: "pull" },
        /* 22 */ { recipe: "words", bg: "cream", duration: 2.1, enter: "slam", text: "Pour les autres, | c’est pareil…", decor: "none" },
        /* 23 */ { recipe: "mascot", bg: "ink", duration: 2.5, enter: "fade", text: "Ce moment qui | t’empêche de dormir…", mood: "surpris", size: "medium", position: "bottom" },
        /* 24 */ { recipe: "words", bg: "cream", duration: 2.1, enter: "slam", text: "ils l’ont sans doute | oublié.", decor: "none" },
        /* 25 */ { recipe: "scene", bg: "ink", duration: 2.1, enter: "wipe", text: "La prochaine fois | qu’il revient…", kind: "memory" },
        /* 26 */ { recipe: "words", bg: "cream", duration: 0.9, enter: "slam", text: "demande-toi…", decor: "none" },
        /* 27 */ { recipe: "words", bg: "accent", duration: 1.3, enter: "fade", text: "Ce souvenir | parle-t-il…", decor: "none" },
        /* 28 */ { recipe: "mascot", bg: "ink", duration: 3.8, enter: "fade", text: "Ce que tu as fait… | ou ce que tu crains | qu’on pense de toi\u00A0?", mood: "perplexe", size: "medium", position: "bottom", camera: "still" },
      ],
      audio: { src: "voix/souvenir-genant.wav" },
    }}
  />
);

export const SouvenirGenantVignette: React.FC = () => (
  <Composition
    id="souvenir-genant-vignette"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi ce souvenir gênant revient toujours la nuit\u00A0?",
      style: {
        palettes: {
          cream: { bg: "#F3ECE0", fg: "#1C1A19", accent: "#E0485A", muted: "#A8A094", shadow: "#E0485A", screen: "#2A2622" },
          ink: { bg: "#1C1A19", fg: "#F3ECE0", accent: "#E0485A", muted: "#5E5850", shadow: "#E0485A", screen: "#2A2622" },
          accent: { bg: "#8FAE97", fg: "#1C1A19", accent: "#E0485A", muted: "#6F9179", shadow: "#E0485A", screen: "#2A2622" },
        },
        textSizes: { giant: 230, hook: 118, title: 88, body: 60, note: 34 },
        shadow: { dx: 8, dy: 7 },
        grain: 0.2,
        progressBar: false,
        riso: { wobble: 4, boil: true, speckle: true },
        series: "",
        textTop: 340,
      },
      shots: [
        /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "Pourquoi ce souvenir gênant | revient toujours la nuit\u00A0?", textStyle: "title", textPos: "top", mood: "gene", size: "large", position: "center" },
      ],
    }}
  />
);
