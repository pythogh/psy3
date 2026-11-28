import React from "react";
import { Composition } from "remotion";
import { videoSchema } from "../schema";
import { Video } from "../../engine/Video";
import { calculateVideoMetadata, DEFAULT_FPS } from "../../engine/timing";

/**
 * « Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone »
 *
 * Important : les defaultProps sont écrits en clair (pas de constante ni de raccourci),
 * sinon npm run synchro et le Studio ne peuvent pas réécrire ce fichier.
 */
export const Video01Composition: React.FC = () => (
  <Composition
    id="01-verifier-telephone"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone",
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
        "Ton téléphone n’a pas vibré. Et pourtant, tu viens de le regarder. Tu le déverrouilles. Rien de nouveau. Tu le reposes. Trente secondes plus tard… tu recommences.",
        "Ce n’est pas un manque de volonté. C’est un apprentissage. Parfois, il y a un message. Souvent, rien. Et c’est justement cette incertitude qui entretient le geste.",
        "En psychologie, on parle de récompense intermittente : sans savoir quand elle arrive, on vérifie plus souvent. Ton cerveau ne réagit pas seulement au message… il réagit à la possibilité d’un message.",
        "Avec le temps, le geste se détache de toute intention. Un ascenseur, une file d’attente, une seconde d’ennui : la main part avant la décision. Des chercheurs l’ont observé : beaucoup d’usages du téléphone ne durent que quelques secondes.",
        "Alors la vraie question n’est peut-être pas ce que tu cherches dans ton téléphone… mais ce que ces quelques secondes t’évitent. Et toi… qu’est-ce que tu évites ?",
      ],
      shots: [{
        recipe: "phone",
        bg: "ink",
        duration: 1.69,
        text: "Ton téléphone | n’a pas vibré.",
        textStyle: "hook",
        screen: "off",
        motion: "none",
        camera: "push",
        startAt: 0,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 2.21,
        text: "Et pourtant, | tu viens de le regarder.",
        enter: "slam",
        screen: "unlock",
        motion: "pop",
        startAt: 1.69,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 0.97,
        text: "Tu le | déverrouilles.",
        enter: "slam",
        decor: "none",
        startAt: 3.9,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 1.05,
        text: "Rien de | nouveau.",
        enter: "slam",
        textPos: "top",
        textStyle: "giant",
        motion: "shake",
        decor: "circle",
        startAt: 4.87,
      }, {
        recipe: "phone",
        bg: "ink",
        duration: 0.75,
        text: "Tu le reposes.",
        screen: "flash",
        motion: "drop",
        camera: "still",
        startAt: 5.92,
      }, {
        recipe: "counter",
        bg: "accent",
        duration: 1.63,
        text: "Trente secondes | plus tard…",
        enter: "wipe",
        to: 30,
        suffix: " s",
        startAt: 6.67,
      }, {
        recipe: "mascot",
        bg: "cream",
        duration: 0.65,
        text: "tu recommences.",
        enter: "slam",
        mood: "perplexe",
        startAt: 8.3,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 2.54,
        text: "Ce n’est pas | un manque | de volonté.",
        enter: "slam",
        decor: "none",
        startAt: 9.6,
      }, {
        recipe: "pattern",
        bg: "cream",
        duration: 1.46,
        text: "C’est un | apprentissage.",
        mode: "sequence",
        startAt: 11.49,
      }, {
        recipe: "phone",
        bg: "accent",
        duration: 1.54,
        text: "Parfois, il y a | un message.",
        enter: "rise",
        notify: true,
        camera: "pull",
        startAt: 12.95,
      }, {
        recipe: "phone",
        bg: "ink",
        duration: 0.74,
        text: "Souvent, | rien.",
        enter: "slam",
        textPos: "top",
        textStyle: "giant",
        motion: "none",
        startAt: 14.49,
      }, {
        recipe: "pattern",
        bg: "cream",
        duration: 1.86,
        text: "Et c’est justement | cette incertitude",
        mode: "irregular",
        seed: "incertitude",
        startAt: 15.8,
      }, {
        recipe: "phoneRow",
        bg: "ink",
        duration: 1.34,
        text: "qui entretient | le geste.",
        enter: "slam",
        count: 3,
        startAt: 17.09,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.89,
        text: "En psychologie, | on parle de :",
        enter: "slam",
        textStyle: "title",
        decor: "none",
        startAt: 19.3,
      }, {
        recipe: "dot",
        bg: "ink",
        duration: 1.89,
        text: "récompense | intermittente",
        textStyle: "term",
        camera: "punch",
        startAt: 20.32,
      }, {
        recipe: "phoneGrid",
        bg: "cream",
        duration: 1.39,
        text: "sans savoir | quand elle arrive,",
        enter: "slide",
        startAt: 22.21,
      }, {
        recipe: "phoneGrid",
        bg: "ink",
        duration: 1.43,
        text: "on vérifie | plus souvent.",
        enter: "slam",
        pace: "fast",
        startAt: 23.6,
      }, {
        recipe: "dot",
        bg: "cream",
        duration: 2.25,
        text: "Ton cerveau ne réagit pas | seulement au message…",
        enter: "zoom",
        shadow: false,
        startAt: 25.03,
      }, {
        recipe: "dot",
        bg: "ink",
        duration: 1.31,
        text: "il réagit | à la possibilité",
        enter: "slam",
        mode: "fillToEmpty",
        shadow: false,
        startAt: 27.28,
      }, {
        recipe: "phone",
        bg: "accent",
        duration: 0.99,
        text: "d’un | message.",
        enter: "slam",
        textPos: "top",
        screen: "on",
        notify: true,
        motion: "pop",
        startAt: 28.59,
      }, {
        recipe: "ground",
        bg: "cream",
        duration: 1.21,
        text: "Avec le temps, | le geste",
        enter: "slide",
        startAt: 30.1,
      }, {
        recipe: "ground",
        bg: "ink",
        duration: 2.28,
        text: "se détache de | toute intention.",
        pace: "fast",
        camera: "drift",
        startAt: 31.3,
      }, {
        recipe: "context",
        bg: "accent",
        duration: 0.91,
        text: "Un ascenseur,",
        enter: "slam",
        kind: "elevator",
        startAt: 33.07,
      }, {
        recipe: "context",
        bg: "cream",
        duration: 1.38,
        text: "une file | d’attente,",
        enter: "slam",
        kind: "queue",
        startAt: 33.98,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 1.31,
        text: "une seconde | d’ennui :",
        enter: "slam",
        mood: "reveur",
        startAt: 35.36,
      }, {
        recipe: "phone",
        bg: "accent",
        duration: 0.3,
        text: "la main | part",
        enter: "slam",
        textStyle: "giant",
        screen: "unlock",
        motion: "pop",
        camera: "punch",
        startAt: 36.67,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.02,
        text: "avant la | décision.",
        enter: "slam",
        startAt: 36.97,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.42,
        text: "Des chercheurs | l’ont observé :",
        enter: "wipe",
        textStyle: "title",
        decor: "none",
        startAt: 37.99,
      }, {
        recipe: "phoneGrid",
        bg: "accent",
        duration: 1.6,
        text: "beaucoup d’usages | du téléphone",
        pace: "fast",
        startAt: 39.5,
      }, {
        recipe: "counter",
        bg: "cream",
        duration: 1.5,
        text: "ne durent que | quelques secondes.",
        enter: "slam",
        to: 3,
        suffix: " s",
        startAt: 41.01,
      }, {
        recipe: "phone",
        bg: "ink",
        duration: 2.05,
        text: "Alors la vraie question | n’est peut-être pas",
        enter: "fade",
        screen: "off",
        motion: "none",
        camera: "pull",
        startAt: 42.51,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 1.95,
        text: "ce que tu cherches | dans ton téléphone…",
        screen: "off",
        motion: "none",
        camera: "pull",
        startAt: 44.56,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.84,
        text: "mais ce que ces | quelques secondes | t’évitent.",
        enter: "slam",
        textStyle: "title",
        decor: "none",
        startAt: 46.51,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 3.6,
        text: "Et toi… | qu’est-ce que | tu évites ?",
        enter: "fade",
        textStyle: "hook",
        mood: "gene",
        position: "bottom",
        startAt: 48.35,
      }],
      audio: {
        src: "voix/01-pourquoi-tu-verifies-ton-telephone.wav",
      },
    }}
  />
);

export const Video01Vignette: React.FC = () => (
  <Composition
    id="01-verifier-telephone-vignette"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone",
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
        /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone\u00A0?", textStyle: "title", textPos: "top", mood: "perplexe", size: "large", position: "center" },
      ],
    }}
  />
);
