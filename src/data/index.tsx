import React from "react";
import { TelephoneComposition, TelephoneVignette } from "./videos/telephone";
import { SouvenirGenantComposition, SouvenirGenantVignette } from "./videos/souvenir-genant";

/**
 * Liste des vidéos du projet. Chaque vidéo est un fichier dans src/data/videos/
 * qui déclare sa composition et contient tous ses réglages.
 * Pour en ajouter une : duplique telephone.tsx, change l'id et le nom du composant, ajoute-le ici.
 */
export const Videos: React.FC = () => (
  <>
    <TelephoneComposition />
    <TelephoneVignette />
    <SouvenirGenantComposition />
    <SouvenirGenantVignette />
  </>
);