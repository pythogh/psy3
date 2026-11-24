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
export const TelephoneComposition: React.FC = () => (
  <Composition
    id="verifier-telephone"
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
        progressBar: true,
        riso: {
          wobble: 4,
          boil: true,
          speckle: true,
        },
        series: "Psycholitchi",
      },
      script: [
        "Tu déverrouilles ton téléphone. Rien de nouveau. Tu le reposes. Trente secondes plus tard, tu recommences. Ce n’est pas un manque de volonté. C’est un apprentissage.",
        "Parfois, il y a un message. Souvent, rien. C’est justement cette incertitude qui entretient le geste. En psychologie, on parle de récompense intermittente : sans savoir quand elle arrive, on vérifie plus souvent, et l’habitude résiste mieux à l’absence de résultat.",
        "Ton cerveau ne réagit pas seulement au message. Il réagit à la possibilité d’un message.",
        "Avec le temps, le geste se détache de toute intention. Un ascenseur, une file d’attente, une seconde d’ennui : la main part avant la décision.",
        "Des chercheurs l’ont observé : beaucoup d’usages du téléphone sont des vérifications de quelques secondes.",
        "La vraie question n’est peut-être pas ce que tu cherches dans ton téléphone. C’est ce que ces quelques secondes t’évitent.",
      ],
      shots: [{
        recipe: "phone",
        bg: "ink",
        duration: 1.82,
        text: "Tu déverrouilles | ton téléphone.",
        screen: "unlock",
        camera: "pull",
        startAt: 0,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 0.99,
        text: "Rien de | nouveau.",
        enter: "slam",
        textPos: "top",
        textStyle: "giant",
        motion: "shake",
        decor: "circle",
        startAt: 1.82,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 0.86,
        text: "Tu le reposes.",
        screen: "flash",
        motion: "drop",
        camera: "still",
        startAt: 2.81,
      }, {
        recipe: "counter",
        bg: "accent",
        duration: 1.44,
        text: "Trente secondes | plus tard,",
        enter: "wipe",
        to: 30,
        suffix: " s",
        startAt: 3.67,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 0.8,
        text: "tu recommences.",
        enter: "slam",
        mood: "perplexe",
        startAt: 5.11,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.85,
        text: "Ce n’est pas | un manque | de volonté.",
        enter: "slam",
        decor: "none",
        startAt: 5.91,
      }, {
        recipe: "pattern",
        bg: "cream",
        duration: 2.5,
        text: "C’est un | apprentissage.",
        mode: "sequence",
        startAt: 7.76,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 1.81,
        text: "Parfois, il y a | un message.",
        enter: "rise",
        notify: true,
        camera: "pull",
        startAt: 10.26,
      }, {
        recipe: "phone",
        bg: "ink",
        duration: 0.8,
        text: "Souvent, | rien.",
        enter: "slam",
        textPos: "top",
        textStyle: "giant",
        motion: "none",
        startAt: 12.07,
      }, {
        recipe: "pattern",
        bg: "cream",
        duration: 1.87,
        text: "C’est justement | cette incertitude",
        seed: "incertitude",
        startAt: 12.87,
      }, {
        recipe: "phoneRow",
        bg: "ink",
        duration: 1.21,
        text: "qui entretient | le geste.",
        enter: "slam",
        count: 3,
        startAt: 14.74,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.48,
        text: "En psychologie, | on parle de :",
        enter: "slam",
        textStyle: "title",
        decor: "none",
        startAt: 15.95,
      }, {
        recipe: "dot",
        bg: "ink",
        duration: 1.48,
        text: "récompense | intermittente",
        textStyle: "term",
        camera: "punch",
        startAt: 17.43,
      }, {
        recipe: "phoneGrid",
        bg: "cream",
        duration: 1.6,
        text: "sans savoir | quand elle arrive,",
        enter: "slide",
        startAt: 18.91,
      }, {
        recipe: "phoneGrid",
        bg: "ink",
        duration: 1.12,
        text: "on vérifie | plus souvent,",
        enter: "slam",
        pace: "fast",
        startAt: 20.51,
      }, {
        recipe: "pattern",
        bg: "cream",
        duration: 1.59,
        text: "et l’habitude | résiste mieux",
        rewards: 0,
        seed: "resiste",
        startAt: 21.63,
      }, {
        recipe: "phone",
        bg: "accent",
        duration: 1.73,
        text: "à l’absence | de résultat.",
        enter: "slam",
        screen: "on",
        motion: "none",
        textPos: "top",
        startAt: 23.22,
      }, {
        recipe: "dot",
        bg: "ink",
        duration: 2.94,
        text: "Ton cerveau ne réagit pas seulement au message.",
        enter: "zoom",
        shadow: false,
        startAt: 24.95,
      }, {
        recipe: "dot",
        bg: "cream",
        duration: 1.61,
        text: "Il réagit à | la possibilité",
        enter: "slam",
        mode: "fillToEmpty",
        shadow: false,
        startAt: 27.89,
      }, {
        recipe: "phone",
        bg: "accent",
        duration: 0.97,
        text: "d’un | message.",
        enter: "slam",
        textPos: "top",
        screen: "on",
        notify: true,
        motion: "pop",
        startAt: 29.5,
      }, {
        recipe: "ground",
        bg: "cream",
        duration: 1.45,
        text: "Avec le temps, | le geste",
        enter: "slide",
        startAt: 30.47,
      }, {
        recipe: "ground",
        bg: "cream",
        duration: 1.75,
        text: "se détache de | toute intention.",
        pace: "fast",
        camera: "drift",
        startAt: 31.92,
      }, {
        recipe: "context",
        bg: "ink",
        duration: 1.14,
        text: "Un ascenseur,",
        enter: "slam",
        kind: "elevator",
        startAt: 33.67,
      }, {
        recipe: "context",
        bg: "accent",
        duration: 0.78,
        text: "une file | d’attente,",
        enter: "slam",
        kind: "queue",
        startAt: 34.81,
      }, {
        recipe: "mascot",
        bg: "cream",
        duration: 1.28,
        text: "une seconde | d’ennui :",
        enter: "slam",
        mood: "reveur",
        startAt: 35.59,
      }, {
        recipe: "phone",
        bg: "ink",
        duration: 0.73,
        text: "la main | part",
        enter: "slam",
        textStyle: "giant",
        screen: "unlock",
        motion: "pop",
        camera: "punch",
        startAt: 36.87,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.59,
        text: "avant la | décision.",
        enter: "slam",
        startAt: 37.6,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.87,
        text: "Des chercheurs | l’ont observé :",
        enter: "wipe",
        textStyle: "title",
        decor: "none",
        startAt: 39.19,
      }, {
        recipe: "phoneGrid",
        bg: "accent",
        duration: 1.21,
        text: "beaucoup d’usages | du téléphone",
        pace: "fast",
        startAt: 41.06,
      }, {
        recipe: "counter",
        bg: "ink",
        duration: 2.84,
        text: "sont des vérifications de quelques secondes.",
        enter: "slam",
        textStyle: "hook",
        to: 3,
        suffix: " s",
        startAt: 42.27,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 1.6,
        text: "La vraie question n’est peut-être pas",
        enter: "fade",
        screen: "off",
        motion: "none",
        camera: "pull",
        startAt: 45.11,
      }, {
        recipe: "phone",
        bg: "cream",
        duration: 1.76,
        text: "ce que tu cherches dans ton téléphone.",
        screen: "off",
        motion: "none",
        camera: "pull",
        startAt: 46.71,
      }, {
        recipe: "mascot",
        bg: "ink",
        duration: 1,
        text: "C’est ce que ces quelques secondes t’évitent.",
        enter: "fade",
        textStyle: "hook",
        mood: "gene",
        position: "bottom",
        startAt: 48.47,
      }, {
        recipe: "dot",
        bg: "accent",
        duration: 3.6,
        text: "Qu’évitent ces quelques secondes ?",
        enter: "slam",
        textPos: "top",
        textStyle: "giant",
        mode: "empty",
        startAt: 49.47,
      }],
      audio: {
        src: "voix/verifier-telephone.wav",
      },
    }}
  />
);

export const TelephoneVignette: React.FC = () => (
  <Composition
    id="verifier-telephone-vignette"
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
        series: "Psycholitchi",
        textTop: 340,
      },
      shots: [
        /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone\u00A0?", textStyle: "title", textPos: "top", mood: "perplexe", size: "large", position: "center" },
      ],
    }}
  />
);
