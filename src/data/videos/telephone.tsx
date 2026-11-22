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
          cream: { bg: "#EDE5D3", fg: "#141210", accent: "#B5470F", muted: "#A39A8A", shadow: "#CFC3AB", screen: "#2A2622" },
          ink: { bg: "#141210", fg: "#EDE5D3", accent: "#D0561A", muted: "#5E5850", shadow: "#3A342E", screen: "#2A2622" },
          accent: { bg: "#B5470F", fg: "#141210", accent: "#EDE5D3", muted: "#8C360B", shadow: "#8C360B", screen: "#2A2622" },
        },
        textSizes: { giant: 230, hook: 118, title: 88, body: 60, note: 34 },
        shadow: { dx: 16, dy: 16 },
        grain: 0.16,
        progressBar: true,
        series: "Psychologie du quotidien",
      },
      shots: [
        { recipe: "phone", bg: "ink", duration: 1.6, text: "Tu déverrouilles | ton téléphone.", screen: "unlock", camera: "pull" },
        { recipe: "phone", bg: "cream", duration: 1.2, text: "Rien de | nouveau.", enter: "slam", textPos: "top", textStyle: "giant", motion: "shake", decor: "circle" },
        { recipe: "phone", bg: "cream", duration: 1.2, text: "Tu le reposes.", screen: "flash", motion: "drop", camera: "still" },
        { recipe: "counter", bg: "accent", duration: 1.7, text: "Trente secondes | plus tard,", enter: "wipe", to: 30, suffix: " s" },
        { recipe: "phoneRow", bg: "ink", duration: 1.4, text: "tu recommences.", enter: "slam", camera: "punch" },
        { recipe: "words", bg: "accent", duration: 1.9, text: "Ce n’est pas | un manque | de volonté.", enter: "slam", decor: "none" },
        { recipe: "pattern", bg: "cream", duration: 2.0, text: "C’est un | apprentissage.", mode: "sequence" },

        { recipe: "phone", bg: "cream", duration: 1.6, text: "Parfois, il y a | un message.", enter: "rise", notify: true, camera: "pull" },
        { recipe: "phone", bg: "ink", duration: 1.1, text: "Souvent, | rien.", enter: "slam", textPos: "top", textStyle: "giant", motion: "none" },
        { recipe: "pattern", bg: "cream", duration: 1.5, text: "C’est justement | cette incertitude", seed: "incertitude" },
        { recipe: "reach", bg: "ink", duration: 1.4, text: "qui entretient | le geste.", enter: "slam" },
        { recipe: "words", bg: "accent", duration: 1.0, text: "En psychologie, | on parle de", enter: "slam", textStyle: "title", decor: "none" },
        { recipe: "dot", bg: "accent", duration: 2.0, text: "Récompense | intermittente", textStyle: "giant", camera: "punch" },
        { recipe: "phoneGrid", bg: "cream", duration: 2.4, text: "quand on ne sait pas quand la récompense arrive,", enter: "slide" },
        { recipe: "phoneGrid", bg: "ink", duration: 1.8, text: "on vérifie | plus souvent,", enter: "slam", pace: "fast" },
        { recipe: "pattern", bg: "cream", duration: 1.8, text: "et l’habitude | résiste mieux", rewards: 0, seed: "resiste" },
        { recipe: "phone", bg: "accent", duration: 2.0, text: "à l’absence | de résultat.", enter: "slam", screen: "on", motion: "none", textPos: "top" },

        { recipe: "dot", bg: "ink", duration: 2.4, text: "Ton cerveau ne réagit pas seulement au message.", enter: "zoom" },
        { recipe: "dot", bg: "cream", duration: 2.0, text: "Il réagit à | la possibilité", enter: "slam", mode: "fillToEmpty" },
        { recipe: "words", bg: "accent", duration: 2.6, text: "d’un | message.", enter: "slam", textPos: "top", decor: "none" },

        { recipe: "ground", bg: "cream", duration: 1.9, text: "Avec le temps, | le geste", enter: "slide" },
        { recipe: "ground", bg: "cream", duration: 1.7, text: "se détache de | toute intention.", pace: "fast", camera: "drift" },
        { recipe: "context", bg: "ink", duration: 1.2, text: "Un ascenseur,", enter: "slam", kind: "elevator" },
        { recipe: "context", bg: "accent", duration: 1.2, text: "une file | d’attente,", enter: "slam", kind: "queue" },
        { recipe: "counter", bg: "cream", duration: 1.4, text: "une seconde | d’ennui\u00A0:", enter: "slam", to: 1, suffix: " s" },
        { recipe: "phone", bg: "ink", duration: 1.6, text: "la main | part", enter: "slam", textStyle: "giant", screen: "unlock", motion: "pop", camera: "punch" },
        { recipe: "words", bg: "accent", duration: 2.2, text: "avant la | décision.", enter: "slam" },

        { recipe: "words", bg: "cream", duration: 2.0, text: "Des chercheurs | l’ont observé\u00A0:", enter: "wipe", textStyle: "title", decor: "none" },
        { recipe: "phoneGrid", bg: "accent", duration: 3.0, text: "une grande partie des usages du téléphone", pace: "fast" },
        { recipe: "counter", bg: "ink", duration: 3.0, text: "sont des vérifications de quelques secondes.", enter: "slam", textStyle: "hook", to: 3, suffix: " s" },

        { recipe: "phone", bg: "cream", duration: 2.6, text: "La vraie question n’est peut-être pas", enter: "fade", screen: "off", motion: "none", camera: "pull" },
        { recipe: "phone", bg: "cream", duration: 2.6, text: "ce que tu cherches dans ton téléphone.", screen: "off", motion: "none", camera: "pull" },
        { recipe: "phone", bg: "ink", duration: 3.3, text: "C’est ce que ces quelques secondes t’évitent.", enter: "fade", textStyle: "hook", screen: "off", motion: "none", camera: "pull" },
        { recipe: "dot", bg: "accent", duration: 3.6, text: "Qu’évitent ces quelques secondes\u00A0?", enter: "slam", textPos: "top", textStyle: "giant", mode: "empty" },
      ],
    }}
  />
);
