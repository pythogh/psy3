# psy-motion

Moteur de motion design éditorial pour fabriquer des vidéos TikTok verticales
(1080 × 1920, 30 images/s, export MP4). Construit avec Remotion, React et TypeScript.

Un seul projet sert à toutes les vidéos :
- **le tronc commun** (moteur, objets dessinés, recettes, thème) est partagé ;
- **chaque vidéo** est un seul fichier de données dans `src/data/videos/`.

Pour une nouvelle vidéo, on ajoute un fichier. On ne copie pas le projet.

---

## Commandes

```bash
npm install          # une fois, au début (et après une mise à jour du projet)
npm run dev          # Studio : aperçu + panneau de réglages
npm run planche      # planche contact : une image par plan → out/<id>-planche.png
npm run render       # export MP4 → out/<id>.mp4
```

`<id>` est l'identifiant de la vidéo, écrit dans son fichier (`id="..."`).
S'il y a plusieurs vidéos dans le projet, précise laquelle :
`npm run planche -- <id>` ou `npm run render -- <id>`.

---

## Organisation du projet

```
src/
  data/
    videos/            ← LES VIDÉOS : un fichier .tsx par vidéo
    index.tsx          ← liste des vidéos du projet
    schema.ts          ← liste de tous les réglages possibles (génère le panneau du Studio)
  recipes/recipes.ts   ← les recettes de plans (format court → plan complet)
  components/
    layers/            ← calques animés (téléphone, grille, compteur, sol…)
    svg/               ← dessins de base des objets
    text/              ← texte cinétique (révélé mot par mot)
  engine/              ← assemblage : plans, transitions, caméra, timeline, planche
  theme/               ← police, marges, courbes de mouvement
public/                ← fichiers statiques : texture de grain, voix off
scripts/run.mjs        ← lanceur des commandes planche et render
RECETTES.md            ← catalogue des recettes et de leurs options
INSTRUCTIONS_PROJET_CLAUDE.md ← consignes à coller dans un Projet Claude
```

Ce qu'on modifie souvent : `src/data/videos/`, `src/data/index.tsx`, `public/` (voix off).
Ce qu'on ne modifie que pour ajouter un nouvel objet ou un nouvel effet : tout le reste.

---

## Fabriquer une vidéo

1. **Écriture** : dans le Projet Claude (consignes : `INSTRUCTIONS_PROJET_CLAUDE.md`),
   donne un thème → script + découpage → validation → Claude livre `src/data/videos/<id>.tsx`.
2. **Ajout au projet** : dépose le fichier dans `src/data/videos/`, puis déclare-le dans
   `src/data/index.tsx` (une ligne d'import et une balise, sur le modèle de celles déjà présentes).
3. **Validation** : `npm run planche`, puis regarde l'image produite dans `out/`.
4. **Retouches** : petites retouches dans le Studio (`npm run dev`) ; corrections importantes
   dans le Projet Claude, en citant les numéros de plans.
5. **Export** : `npm run render`, puis publication.

---

## Format d'une vidéo : des recettes

Une ligne = un plan :

```ts
{ recipe: "phone", bg: "ink", duration: 1.6, text: "Premier mot | deuxième ligne.", screen: "unlock" },
```

- `recipe` choisit le visuel ; le moteur calcule positions, tailles et caméra.
- `bg` : fond `cream`, `ink` ou `accent`. Les couleurs des objets et du texte s'adaptent seules.
- `text` : texte affiché, révélé mot par mot. Le signe `|` force un retour à la ligne.

Catalogue complet des recettes et de leurs options : **`RECETTES.md`**.

---

## Le Studio (`npm run dev`)

Choisis la vidéo dans la colonne de gauche. Colonne de droite, section **Default Props** :

- `planche` : coché, affiche la planche contact au lieu de la vidéo ;
- `style` : couleurs des trois fonds, tailles de texte, ombre (0 / 0 = sans ombre), grain,
  barre de progression, titre de série ;
- `audio` : voix off (voir plus bas) ;
- `shots` : les plans dans l'ordre, chacun avec sa recette et ses options.

Chaque modification s'enregistre automatiquement dans le fichier de la vidéo
(Cmd+Z / Ctrl+Z dans le Studio pour annuler). Le Studio réécrit alors chaque plan
sur plusieurs lignes : c'est normal.

---

## Voix off

1. Place le fichier MP3 ou WAV dans `public/` (par exemple `public/voix/<id>.mp3`).
2. Dans le Studio, active `audio` et indique `src` : `voix/<id>.mp3`.
3. Cale les plans sur la voix : ajuste `duration`, ou renseigne `startAt`
   (seconde de la voix off où le plan commence).

---

## Ajouter un nouvel objet ou un nouvel effet

Quand un sujet demande un visuel qui n'existe pas (un stylo, un frigo…) :

1. dessin de l'objet dans `src/components/svg/` ;
2. calque animé dans `src/components/layers/`, déclaré dans `layers/registry.tsx`
   et décrit dans `layerSchema` (`src/data/schema.ts`) ;
3. recette dans `src/recipes/recipes.ts`, décrite dans `recipeShotSchema` (`schema.ts`) ;
4. une ligne dans `RECETTES.md` et dans le catalogue de `INSTRUCTIONS_PROJET_CLAUDE.md`.

L'objet devient alors disponible pour toutes les vidéos suivantes.

---

## Où faire tourner le projet

- **Sur ton ordinateur** : installer Node.js (version LTS), puis les commandes ci-dessus.
- **Dans le navigateur, sans rien installer** : GitHub Codespaces. Le dossier `.devcontainer/`
  installe automatiquement tout le nécessaire à l'ouverture.

## Déterminisme

Aucune animation n'est aléatoire au rendu : tout dépend du numéro d'image, et les placements
pseudo-aléatoires utilisent une graine fixe. Même fichier = même vidéo, à chaque rendu.
