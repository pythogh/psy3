import React from "react";
import { Composition } from "remotion";
import { videoSchema } from "../schema";
import { Video } from "../../engine/Video";
import { calculateVideoMetadata, DEFAULT_FPS } from "../../engine/timing";

export const Video03Composition: React.FC = () => (
  <Composition
    id="03-silence-genant"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi le silence avec quelqu’un te met mal à l’aise ?",
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
        "Ce silence gênant avec quelqu’un, il vient d’où ? Il ne se passe rien, et pourtant tu cherches un sujet, juste pour que ça s’arrête.",
        "Dans une conversation, on se passe la parole très vite, en une fraction de seconde. Ton cerveau est réglé sur ce rythme. Quand il se casse, il le remarque tout de suite.",
        "Mais un silence ne dit rien. Alors ton cerveau comble le vide, souvent avec la pire version… il s’ennuie, il me juge. Et comme tu crois que ça se voit, tu penses que c’est à toi de réparer.",
        "Pourtant, avec certaines personnes, le même silence ne te gêne pas. Avec elles, tu sais déjà où tu en es. Le malaise ne vient pas du silence, mais du doute sur le lien.",
        "Alors la prochaine fois, avant de remplir le blanc… demande-toi si c’est le silence qui te gêne, ou ce que tu crois qu’il veut dire.",
      ],
      shots: [{
        recipe: "scene",
        bg: "cream",
        duration: 2.88,
        text: "Ce silence *gênant* | avec quelqu’un, | il vient d’où ?",
        textStyle: "hook",
        textPos: "top",
        kind: "coffee",
        startAt: 0,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.2,
        text: "Il ne se passe | rien.",
        enter: "slam",
        decor: "none",
        camera: "punch",
        startAt: 2.88,
      }, {
        recipe: "mascot",
        bg: "accent",
        duration: 1.63,
        text: "Et pourtant, | tu cherches | un sujet…",
        mood: "gene",
        position: "bottom",
        startAt: 4.08,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.96,
        text: "Juste pour que | ça *s’arrête*.",
        enter: "slam",
        decor: "none",
        textPos: "bottom",
        startAt: 5.71,
      }, {
        recipe: "pattern",
        bg: "ink",
        duration: 2.02,
        text: "Dans une conversation, | on se passe | la *parole*",
        mode: "sequence",
        seed: "rythme",
        enter: "rise",
        startAt: 7.67,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 2.18,
        text: "Très vite, | en une fraction | de seconde.",
        enter: "slam",
        decor: "square",
        camera: "pull",
        startAt: 9.69,
      }, {
        recipe: "scene",
        bg: "cream",
        duration: 3.16,
        text: "Ton cerveau est réglé | sur ce *rythme*… | quand il se casse,",
        kind: "metronome",
        frame: "small",
        camera: "still",
        sfx: "tick",
        startAt: 11.87,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 2.08,
        text: "Il le remarque | tout de suite.",
        enter: "slam",
        decor: "none",
        camera: "punch",
        startAt: 15.03,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.63,
        text: "Un silence | ne dit | rien.",
        enter: "wipe",
        decor: "none",
        textPos: "top",
        startAt: 17.11,
      }, {
        recipe: "scene",
        bg: "accent",
        duration: 1.95,
        text: "Ton cerveau | comble le *vide*,",
        kind: "coffee",
        frame: "right",
        camera: "drift",
        startAt: 18.74,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.22,
        text: "Avec la pire | version…",
        decor: "none",
        textPos: "bottom",
        startAt: 20.69,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 0.93,
        text: "« Il s’ennuie. »",
        enter: "slam",
        decor: "none",
        startAt: 21.91,
      }, {
        recipe: "scene",
        bg: "cream",
        duration: 1.28,
        text: "« Il me juge. »",
        kind: "coffee",
        frame: "left",
        enter: "slam",
        startAt: 22.84,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.22,
        text: "Tu *crois* | que ça se voit,",
        decor: "circle",
        startAt: 24.12,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 2.55,
        text: "Tu penses que | c’est à toi | de *réparer*.",
        textStyle: "hook",
        decor: "none",
        camera: "punch",
        startAt: 25.34,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.64,
        text: "Pourtant, | avec certaines | personnes…",
        enter: "rise",
        decor: "none",
        camera: "drift",
        startAt: 27.89,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.7,
        text: "Le même silence | ne te gêne pas.",
        textStyle: "hook",
        decor: "none",
        startAt: 29.53,
      }, {
        recipe: "mascot",
        bg: "accent",
        duration: 2.52,
        text: "Avec elles, | tu sais déjà | où tu en es.",
        mood: "content",
        position: "bottom",
        startAt: 31.23,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.91,
        text: "Le malaise | ne vient pas | du silence,",
        textStyle: "hook",
        enter: "slam",
        decor: "none",
        startAt: 33.75,
      }, {
        recipe: "scene",
        bg: "cream",
        duration: 2.3,
        text: "Mais du *doute* | sur le lien.",
        kind: "typing",
        textStyle: "term",
        textPos: "bottom",
        startAt: 35.66,
      }, {
        recipe: "scene",
        bg: "ink",
        duration: 2.8,
        text: "La prochaine fois, | avant de remplir | le blanc…",
        kind: "coffee",
        frame: "small",
        enter: "wipe",
        startAt: 37.96,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 2.49,
        text: "Demande-toi | si c’est le silence | qui te gêne…",
        enter: "slam",
        decor: "none",
        startAt: 40.76,
      }, {
        recipe: "mascot",
        bg: "cream",
        duration: 3.6,
        text: "…ou ce que tu crois | qu’il veut dire ?",
        mood: "perplexe",
        position: "bottom",
        enter: "fade",
        startAt: 43.25,
      }],
      audio: {
        src: "voix/03-silence-genant.wav",
      },
    }}
  />
);

export const Video03Vignette: React.FC = () => (
  <Composition
    id="03-silence-genant-vignette"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi le silence avec quelqu’un te met mal à l’aise\u00A0?",
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
        /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "Pourquoi le silence | avec quelqu’un | te met mal à l’aise\u00A0?", textStyle: "title", textPos: "top", mood: "gene", size: "large", position: "center" },
      ],
    }}
  />
);
