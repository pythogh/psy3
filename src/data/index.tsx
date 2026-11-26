import React from "react";
import { Video01Composition, Video01Vignette } from "./videos/01-pourquoi-tu-verifies-ton-telephone";
import { Video02Composition, Video02Vignette } from "./videos/02-souvenirs-genants-la-nuit";

/**
 * Liste des vidéos du projet. Chaque vidéo est un fichier dans src/data/videos/
 * nommé NN-sujet-en-clair.tsx, avec ses composants VideoNNComposition et VideoNNVignette.
 */
export const Videos: React.FC = () => (
  <>
    <Video01Composition />
    <Video01Vignette />
    <Video02Composition />
    <Video02Vignette />
  </>
);