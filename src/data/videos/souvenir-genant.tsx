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
      title: "Pourquoi ce souvenir gênant revient toujours la nuit ?",
      style: {
        palettes: {
          cream: {
            bg: "#F3ECE0",
            fg: "#1C1A19",
            accent: "#E0485A",
            muted: "#A8A094",
            shadow: "#E0485A",
            screen: "#2A2622",
          },
          ink: {
            bg: "#1C1A19",
            fg: "#F3ECE0",
            accent: "#E0485A",
            muted: "#5E5850",
            shadow: "#E0485A",
            screen: "#2A2622",
          },
          accent: {
            bg: "#8FAE97",
            fg: "#1C1A19",
            accent: "#E0485A",
            muted: "#6F9179",
            shadow: "#E0485A",
            screen: "#2A2622",
          },
        },
        textSizes: {
          giant: 230,
          hook: 118,
          title: 88,
          body: 60,
          note: 34,
        },
        shadow: {
          dx: 8,
          dy: 7,
        },
        grain: 0.2,
        progressBar: false,
        riso: {
          wobble: 4,
          boil: true,
          speckle: true,
        },
        series: "",
      },
      script: [
        "Tu rougis encore d’une gêne vieille de dix ans, à trois heures du matin ? Une phrase ratée, un « toi aussi » lancé au serveur… et la chaleur te remonte au visage, dans le noir.",
        "La nuit, ton cerveau n’a plus rien à traiter. Pas d’écran, pas de bruit. Alors il vagabonde, souvent vers ce qui te concerne. Et la fatigue rend les émotions plus dures à apaiser.",
        "Or la gêne est une émotion sociale. Elle a touché ton image aux yeux des autres, donc ta mémoire l’a gardée. Pas seulement la scène… la sensation aussi.",
        "Pourtant, essaie de te rappeler la dernière gêne d’un ami. Tu ne t’en souviens pas, n’est-ce pas ? Pour les autres, c’est pareil… ce moment qui t’empêche de dormir, ils l’ont sans doute oublié.",
        "Alors, la prochaine fois qu’il revient à trois heures du matin, demande-toi… ce souvenir parle-t-il de ce que tu as fait, ou de ce que tu crains qu’on pense de toi ?",
      ],
      shots: [{
        recipe: "scene",
        bg: "ink",
        duration: 2.1,
        text: "Tu rougis encore | d’une gêne vieille | de dix ans ?",
        textStyle: "hook",
        textPos: "top",
        kind: "night",
        camera: "push",
        startAt: 0,
      }, {
        recipe: "motif",
        bg: "cream",
        duration: 1.25,
        enter: "slam",
        text: "À trois heures | du matin ?",
        kind: "ripples",
        startAt: 2.1,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.27,
        enter: "slam",
        text: "Une phrase | ratée.",
        decor: "none",
        startAt: 3.35,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 2.37,
        enter: "slam",
        text: "Un « toi aussi » | au serveur…",
        decor: "none",
        startAt: 4.62,
      }, {
        recipe: "scene",
        bg: "cream",
        duration: 2.08,
        enter: "slam",
        text: "La chaleur | te remonte | au visage.",
        kind: "covers",
        startAt: 6.99,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 1.08,
        enter: "fade",
        text: "Dans le noir.",
        mood: "gene",
        size: "medium",
        position: "bottom",
        startAt: 8.7,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.48,
        enter: "wipe",
        text: "La nuit, | ton cerveau…",
        decor: "none",
        startAt: 10.15,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.24,
        text: "n’a plus rien | à traiter.",
        decor: "none",
        startAt: 11.63,
      }, {
        recipe: "phone",
        bg: "ink",
        duration: 0.84,
        enter: "slam",
        text: "Pas d’écran,",
        screen: "off",
        motion: "drop",
        startAt: 12.87,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 0.68,
        enter: "slam",
        text: "pas de bruit.",
        decor: "none",
        startAt: 13.71,
      }, {
        recipe: "motif",
        bg: "accent",
        duration: 1.73,
        enter: "zoom",
        text: "Alors | il vagabonde,",
        kind: "knot",
        startAt: 14.39,
      }, {
        recipe: "motif",
        bg: "ink",
        duration: 1.23,
        text: "vers ce qui | te concerne.",
        kind: "spiral",
        camera: "push",
        startAt: 16.12,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 0.62,
        enter: "slam",
        text: "Et la fatigue…",
        decor: "none",
        startAt: 17.35,
      }, {
        recipe: "motif",
        bg: "accent",
        duration: 2.32,
        text: "rend les émotions | plus dures | à apaiser.",
        kind: "waves",
        startAt: 17.97,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 2.81,
        enter: "rise",
        text: "La gêne est | une émotion sociale.",
        textStyle: "term",
        decor: "none",
        startAt: 20.29,
      }, {
        recipe: "motif",
        bg: "cream",
        duration: 1.57,
        text: "Ton image | aux yeux des autres.",
        kind: "orbit",
        startAt: 23.1,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.46,
        enter: "slam",
        text: "Ta mémoire | l’a gardée.",
        decor: "none",
        startAt: 24.67,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.42,
        enter: "slam",
        text: "Pas seulement | la scène…",
        decor: "none",
        startAt: 26.13,
      }, {
        recipe: "motif",
        bg: "cream",
        duration: 2.64,
        text: "la sensation | aussi.",
        kind: "split",
        startAt: 27.55,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 2.48,
        enter: "slide",
        text: "Essaie de te rappeler | la gêne d’un ami.",
        decor: "none",
        startAt: 30.19,
      }, {
        recipe: "motif",
        bg: "ink",
        duration: 1.76,
        text: "Tu ne t’en | souviens pas ?",
        kind: "ripples",
        camera: "pull",
        startAt: 32.67,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.68,
        enter: "slam",
        text: "Pour les autres, | c’est pareil…",
        decor: "none",
        startAt: 34.43,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 1.92,
        enter: "fade",
        text: "Ce moment qui | t’empêche de dormir…",
        mood: "surpris",
        size: "medium",
        position: "bottom",
        startAt: 36.11,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 2.35,
        enter: "slam",
        text: "ils l’ont sans doute | oublié.",
        decor: "none",
        startAt: 38.03,
      }, {
        recipe: "motif",
        bg: "ink",
        duration: 2.49,
        enter: "wipe",
        text: "La prochaine fois | qu’il revient…",
        kind: "orbit",
        startAt: 40.38,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.12,
        enter: "slam",
        text: "demande-toi…",
        decor: "none",
        startAt: 42.87,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.54,
        enter: "fade",
        text: "Ce souvenir | parle-t-il…",
        decor: "none",
        startAt: 43.99,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 4.16,
        enter: "fade",
        text: "Ce que tu as fait… | ou ce que tu crains | qu’on pense de toi ?",
        mood: "perplexe",
        size: "medium",
        position: "bottom",
        camera: "still",
        startAt: 45.53,
      }],
      audio: {
        src: "voix/souvenir-genant.wav",
      },
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
