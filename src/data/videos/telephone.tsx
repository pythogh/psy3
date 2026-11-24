import React from "react";
import { Composition } from "remotion";
import { videoSchema } from "../schema";
import { Video } from "../../engine/Video";
import { calculateVideoMetadata, DEFAULT_FPS } from "../../engine/timing";

/**
 * « Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone »
 *
 * Une ligne = un plan = une recette (voir RECETTES.md).
 * Réglable dans le Studio (npm run dev → colonne de droite) : chaque changement est
 * enregistré automatiquement dans ce fichier (Ctrl+Z / Cmd+Z pour annuler).
 */

const title = "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone";

const style = {
  palettes: {
    cream: { bg: "#EDE5D3", fg: "#141210", accent: "#B5470F", muted: "#A39A8A", shadow: "#CFC3AB", screen: "#2A2622" },
    ink: { bg: "#141210", fg: "#EDE5D3", accent: "#D0561A", muted: "#5E5850", shadow: "#3A342E", screen: "#2A2622" },
    accent: { bg: "#B5470F", fg: "#141210", accent: "#EDE5D3", muted: "#8C360B", shadow: "#8C360B", screen: "#2A2622" },
  },
  textSizes: { giant: 230, hook: 118, title: 88, body: 60, note: 34 },
  shadow: { dx: 16, dy: 16 },
  grain: 0.16,
  progressBar: true,
  series: "Psychologie du quotidien",
};

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
      title,
      style,
      shots: [
        /* 1 */ { recipe: "phone", bg: "ink", duration: 1.91, text: "Tu déverrouilles | ton téléphone.", screen: "unlock", camera: "pull", startAt: 0 },
        /* 2 */ { recipe: "phone", bg: "cream", duration: 1.07, text: "Rien de | nouveau.", enter: "slam", textPos: "top", textStyle: "giant", motion: "shake", decor: "circle", startAt: 1.91 },
        /* 3 */ { recipe: "phone", bg: "cream", duration: 1.09, text: "Tu le reposes.", screen: "flash", motion: "drop", camera: "still", startAt: 2.98 },
        /* 4 */ { recipe: "counter", bg: "accent", duration: 1.43, text: "Trente secondes | plus tard,", enter: "wipe", to: 30, suffix: " s", startAt: 4.07 },
        /* 5 */ { recipe: "mascot", bg: "ink", duration: 1.36, text: "tu recommences.", enter: "slam", mood: "perplexe", startAt: 5.5 },
        /* 6 */ { recipe: "words", bg: "accent", duration: 2.1, text: "Ce n’est pas | un manque | de volonté.", enter: "slam", decor: "none", startAt: 6.86 },
        /* 7 */ { recipe: "pattern", bg: "cream", duration: 1.8, text: "C’est un | apprentissage.", mode: "sequence", startAt: 8.96 },
        /* 8 */ { recipe: "phone", bg: "cream", duration: 2.05, text: "Parfois, il y a | un message.", enter: "rise", notify: true, camera: "pull", startAt: 10.76 },
        /* 9 */ { recipe: "phone", bg: "ink", duration: 1.6, text: "Souvent, | rien.", enter: "slam", textPos: "top", textStyle: "giant", motion: "none", startAt: 12.81 },
        /* 10 */ { recipe: "pattern", bg: "cream", duration: 1.79, text: "C’est justement | cette incertitude", seed: "incertitude", startAt: 14.42 },
        /* 11 */ { recipe: "phoneRow", bg: "ink", duration: 2.37, text: "qui entretient | le geste.", enter: "slam", count: 3, startAt: 16.2 },
        /* 12 */ { recipe: "words", bg: "accent", duration: 1.59, text: "En psychologie, | on parle de", enter: "slam", textStyle: "title", decor: "none", startAt: 18.57 },
        /* 13 */ { recipe: "dot", bg: "accent", duration: 1.42, text: "Récompense | intermittente", textStyle: "giant", camera: "punch", startAt: 20.16 },
        /* 14 */ { recipe: "phoneGrid", bg: "cream", duration: 1.82, text: "sans savoir | quand elle arrive,", enter: "slide", startAt: 21.58 },
        /* 15 */ { recipe: "phoneGrid", bg: "ink", duration: 1.64, text: "on vérifie | plus souvent,", enter: "slam", pace: "fast", startAt: 23.4 },
        /* 16 */ { recipe: "pattern", bg: "cream", duration: 1.47, text: "et l’habitude | résiste mieux", rewards: 0, seed: "resiste", startAt: 25.04 },
        /* 17 */ { recipe: "phone", bg: "accent", duration: 1.58, text: "à l’absence | de résultat.", enter: "slam", screen: "on", motion: "none", textPos: "top", startAt: 26.51 },
        /* 18 */ { recipe: "dot", bg: "ink", duration: 2.95, text: "Ton cerveau ne réagit pas seulement au message.", enter: "zoom", shadow: false, startAt: 28.09 },
        /* 19 */ { recipe: "dot", bg: "cream", duration: 1.74, text: "Il réagit à | la possibilité", enter: "slam", mode: "fillToEmpty", shadow: false, startAt: 31.04 },
        /* 20 */ { recipe: "phone", bg: "accent", duration: 1.65, text: "d’un | message.", enter: "slam", textPos: "top", screen: "on", notify: true, motion: "pop", startAt: 32.78 },
        /* 21 */ { recipe: "ground", bg: "cream", duration: 1.28, text: "Avec le temps, | le geste", enter: "slide", startAt: 34.43 },
        /* 22 */ { recipe: "ground", bg: "cream", duration: 1.96, text: "se détache de | toute intention.", pace: "fast", camera: "drift", startAt: 35.71 },
        /* 23 */ { recipe: "context", bg: "ink", duration: 1, text: "Un ascenseur,", enter: "slam", kind: "elevator", startAt: 37.67 },
        /* 24 */ { recipe: "context", bg: "accent", duration: 1.28, text: "une file | d’attente,", enter: "slam", kind: "queue", startAt: 38.67 },
        /* 25 */ { recipe: "mascot", bg: "cream", duration: 1.53, text: "une seconde | d’ennui\u00A0:", enter: "slam", mood: "reveur", startAt: 39.95 },
        /* 26 */ { recipe: "phone", bg: "ink", duration: 0.79, text: "la main | part", enter: "slam", textStyle: "giant", screen: "unlock", motion: "pop", camera: "punch", startAt: 41.48 },
        /* 27 */ { recipe: "words", bg: "accent", duration: 1.3, text: "avant la | décision.", enter: "slam", startAt: 42.27 },
        /* 28 */ { recipe: "words", bg: "cream", duration: 1.9, text: "Des chercheurs | l’ont observé\u00A0:", enter: "wipe", textStyle: "title", decor: "none", startAt: 43.57 },
        /* 29 */ { recipe: "phoneGrid", bg: "accent", duration: 1.34, text: "beaucoup d’usages | du téléphone", pace: "fast", startAt: 45.47 },
        /* 30 */ { recipe: "counter", bg: "ink", duration: 3.01, text: "sont des vérifications de quelques secondes.", enter: "slam", textStyle: "hook", to: 3, suffix: " s", startAt: 46.81 },
        /* 31 */ { recipe: "phone", bg: "cream", duration: 1.73, text: "La vraie question n’est peut-être pas", enter: "fade", screen: "off", motion: "none", camera: "pull", startAt: 49.82 },
        /* 32 */ { recipe: "phone", bg: "cream", duration: 1.99, text: "ce que tu cherches dans ton téléphone.", screen: "off", motion: "none", camera: "pull", startAt: 51.55 },
        /* 33 */ { recipe: "mascot", bg: "ink", duration: 2.44, text: "C’est ce que ces quelques secondes t’évitent.", enter: "fade", textStyle: "hook", mood: "gene", position: "bottom", startAt: 53.54 },
        /* 34 */ { recipe: "dot", bg: "accent", duration: 3.6, text: "Qu’évitent ces quelques secondes\u00A0?", enter: "slam", textPos: "top", textStyle: "giant", mode: "empty", startAt: 55.98 },
      ],
      voix: {
        id: "EXAVITQu4vr4xnSDxMaL",
        nom: "Sarah - Mature, Reassuring, Confident",
        stabilite: 0.45,
        style: 0.2,
        vitesse: 1,
      },
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
      title,
      style: { ...style, progressBar: false },
      shots: [
        /* 0 */ { recipe: "mascot", bg: "ink", duration: 1, text: "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone\u00A0?", textStyle: "title", mood: "perplexe", size: "large", position: "bottom" },
      ],
    }}
  />
);
