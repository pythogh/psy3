import React from "react";
import { Composition } from "remotion";
import { videoSchema } from "../schema";
import { Video } from "../../engine/Video";
import { calculateVideoMetadata, DEFAULT_FPS } from "../../engine/timing";

export const Video04Composition: React.FC = () => (
  <Composition
    id="04-black-friday-peur-de-rater"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi tu achètes au Black Friday sans en avoir besoin ?",
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
        "Pourquoi tu achètes pendant le Black Friday des choses dont tu n’avais pas besoin la veille ? Fais un test, avec un simple pull.",
        "Un pull à quarante euros, tu passes devant sans le voir. Le même pull, prix barré à quatre-vingts, moins cinquante pour cent jusqu’à minuit… et là, tu hésites.",
        "Le pull n’a pas changé. Ce qui a changé, c’est la question dans ta tête. Ce n’est plus « est-ce que j’en ai besoin », c’est « est-ce que je vais rater l’affaire ».",
        "Et ton cerveau déteste perdre. Une perte pèse plus lourd qu’un gain de même taille. Alors ne pas acheter ne ressemble plus à une économie… mais à quarante euros perdus.",
        "Le compte à rebours n’est là que pour ça. Alors avant de payer, pose-toi juste une question… est-ce que tu l’aurais acheté au prix normal ?",
      ],
      shots: [{
        recipe: "motif",
        bg: "cream",
        duration: 1.71,
        text: "Pourquoi | tu achètes | pendant le | *Black Friday*",
        textStyle: "hook",
        kind: "tag",
        startAt: 0,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.44,
        text: "Des choses | dont tu n’avais | pas *besoin*",
        textStyle: "hook",
        decor: "none",
        enter: "slam",
        startAt: 1.71,
      }, {
        recipe: "mascot",
        bg: "accent",
        duration: 1.26,
        text: "La veille ?",
        mood: "perplexe",
        size: "medium",
        startAt: 3.15,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 2.74,
        text: "Fais un test, | avec un | simple pull.",
        textStyle: "hook",
        decor: "none",
        startAt: 4.41,
      }, {
        recipe: "counter",
        bg: "ink",
        duration: 1.58,
        text: "Un pull | à quarante | euros,",
        to: 40,
        suffix: " €",
        enter: "slide",
        startAt: 7.15,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.78,
        text: "Tu passes devant | sans le voir.",
        textStyle: "hook",
        decor: "none",
        startAt: 8.73,
      }, {
        recipe: "motif",
        bg: "cream",
        duration: 1.69,
        text: "Le même pull, | prix barré à | quatre-vingts,",
        kind: "tag",
        camera: "still",
        startAt: 10.51,
      }, {
        recipe: "motif",
        bg: "cream",
        duration: 1.68,
        text: "Moins cinquante | pour cent",
        kind: "tag",
        continued: true,
        camera: "punch",
        sfx: "thud",
        startAt: 12.2,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.59,
        text: "Jusqu’à | *minuit*…",
        decor: "none",
        enter: "slam",
        startAt: 13.88,
      }, {
        recipe: "mascot",
        bg: "accent",
        duration: 1.68,
        text: "Et là, | tu hésites.",
        mood: "surpris",
        position: "bottom",
        startAt: 15.47,
      }, {
        recipe: "motif",
        bg: "ink",
        duration: 1.64,
        text: "Le pull | n’a pas changé.",
        kind: "tag",
        frame: "small",
        enter: "wipe",
        startAt: 17.15,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.8,
        text: "Ce qui a changé, | c’est la | *question*",
        textStyle: "hook",
        decor: "none",
        startAt: 18.79,
      }, {
        recipe: "motif",
        bg: "ink",
        duration: 0.92,
        text: "Dans ta tête.",
        kind: "spiral",
        frame: "close",
        startAt: 20.59,
      }, {
        recipe: "mascot",
        bg: "accent",
        duration: 2.1,
        text: "Ce n’est plus | « est-ce que | j’en ai besoin »,",
        textStyle: "title",
        mood: "reveur",
        position: "bottom",
        startAt: 21.51,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 2.62,
        text: "C’est « est-ce que | je vais rater | l’affaire ».",
        textStyle: "hook",
        decor: "none",
        camera: "punch",
        startAt: 23.61,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 2.39,
        text: "Et ton cerveau | déteste *perdre*.",
        textStyle: "hook",
        decor: "none",
        enter: "rise",
        startAt: 26.23,
      }, {
        recipe: "motif",
        bg: "cream",
        duration: 1.43,
        text: "Une perte | pèse plus lourd",
        kind: "scale",
        camera: "still",
        sfx: "thud",
        startAt: 28.62,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 1.58,
        text: "qu’un gain | de même taille.",
        textStyle: "hook",
        decor: "none",
        startAt: 30.05,
      }, {
        recipe: "words",
        bg: "cream",
        duration: 1.07,
        text: "Alors, | ne pas | acheter",
        decor: "none",
        enter: "slam",
        startAt: 31.63,
      }, {
        recipe: "scene",
        bg: "ink",
        duration: 2.02,
        text: "Ne ressemble | plus à une | *économie*…",
        kind: "receipt",
        startAt: 32.7,
      }, {
        recipe: "words",
        bg: "accent",
        duration: 2.07,
        text: "Mais à quarante | euros *perdus*.",
        textStyle: "hook",
        decor: "none",
        camera: "punch",
        startAt: 34.72,
      }, {
        recipe: "scene",
        bg: "cream",
        duration: 1.03,
        text: "Le compte | à rebours",
        kind: "cart",
        sfx: "tick",
        enter: "wipe",
        startAt: 36.79,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 1.33,
        text: "N’est là | que | pour ça.",
        decor: "none",
        enter: "slam",
        camera: "punch",
        startAt: 37.82,
      }, {
        recipe: "scene",
        bg: "accent",
        duration: 1.38,
        text: "Alors, avant | de payer,",
        kind: "pay",
        camera: "still",
        startAt: 39.15,
      }, {
        recipe: "scene",
        bg: "accent",
        duration: 1.7,
        text: "Pose-toi juste | une question…",
        kind: "pay",
        continued: true,
        startAt: 40.53,
      }, {
        recipe: "words",
        bg: "ink",
        duration: 3.5,
        text: "Est-ce que | tu l’aurais acheté | au prix *normal* ?",
        textStyle: "title",
        decor: "none",
        enter: "fade",
        camera: "still",
        startAt: 42.23,
      }],
      audio: {
        src: "voix/04-black-friday-peur-de-rater.wav",
      },
    }}
  />
);

export const Video04Vignette: React.FC = () => (
  <Composition
    id="04-black-friday-peur-de-rater-vignette"
    component={Video}
    schema={videoSchema}
    width={1080}
    height={1920}
    fps={DEFAULT_FPS}
    durationInFrames={1}
    calculateMetadata={calculateVideoMetadata}
    defaultProps={{
      title: "Pourquoi tu achètes au Black Friday sans en avoir besoin\u00A0?",
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
        /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "Pourquoi tu achètes | au Black Friday | sans en avoir besoin\u00A0?", textStyle: "title", textPos: "top", mood: "envie", size: "large", position: "center" },
      ],
    }}
  />
);
