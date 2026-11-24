# Psycholitchi

Moteur de motion design éditorial pour fabriquer les vidéos TikTok verticales de **Psycholitchi**,
la chaîne de psychologie du quotidien (1080 × 1920, 30 images/s, export MP4).
Construit avec Remotion, React et TypeScript.

Un seul projet sert à toutes les vidéos :
- **le tronc commun** (moteur, objets dessinés, recettes, thème) est partagé ;
- **chaque vidéo** est un seul fichier de données dans `src/data/videos/`, qui contient aussi sa vignette.

Pour une nouvelle vidéo, on ajoute un fichier. On ne copie pas le projet.

---

## Commandes

```bash
npm install          # une fois, au début (et après une mise à jour du projet)
npm run dev          # Studio : aperçu + panneau de réglages
npm run synchro      # cale chaque plan sur la voix off (Whisper)
npm run planche      # planche contact : une image par plan → out/<id>-planche.png
npm run render       # export MP4 → out/<id>.mp4
npx tsc --noEmit     # vérifie le code (n'affiche rien si tout va bien)
```

`<id>` est l'identifiant de la vidéo, écrit dans son fichier (`id="..."`).
S'il y a plusieurs vidéos dans le projet, précise laquelle : `npm run planche -- <id>`, `npm run render -- <id>`.

Vignette (image de couverture TikTok) :

```bash
npx remotion still src/index.ts <id>-vignette out/<id>-vignette.png --frame=40
```

`--frame=40` prend l'image après l'apparition de la mascotte (la vignette dure 2 s).

---

## Fabriquer une vidéo

Le travail d'écriture se fait dans le Projet Claude, dont les consignes sont dans
`INSTRUCTIONS_PROJET_CLAUDE.md`. Une conversation par vidéo.

1. **Script** : donne un thème au Projet Claude → script dit, mécanique psychologique, propositions de titre.
   Relis et corrige.
2. **Fichier vidéo** : script validé → Claude livre `src/data/videos/<id>.tsx` complet
   (script, plans numérotés, vignette).
3. **Ajout au projet** : dépose le fichier dans `src/data/videos/`, puis déclare ses deux compositions
   dans `src/data/index.tsx` (import + balises, ex. `<TelephoneComposition />` et `<TelephoneVignette />`).
4. **Voix** : génère la voix gratuitement sur cliputils.com en collant le script tel quel,
   puis dépose le fichier dans `public/voix/<id>.wav`.
5. **Calage** : `npm run synchro -- <id>`. Si le fichier audio a un autre nom :
   `npm run synchro -- <id> --audio public/voix/<fichier>.wav`.
6. **Validation** : `npm run planche -- <id>`. Corrections dans le Projet Claude, en citant les numéros
   de plans. Après une synchro, ne remplacer que les blocs modifiés, pour garder les calages.
7. **Export** : `npm run render -- <id>`, puis la vignette avec `npx remotion still …` (voir plus haut).
8. **Publication** : la musique de fond s'ajoute dans TikTok au moment de publier, pas dans le projet.

---

## Direction artistique : risographie et ligne organique

- **Palette** : crème, encre et vert sauge, avec le rouge litchi comme seule couleur d'accent.
- **Effet riso** : trait d'encre légèrement tremblé, couche de couleur rouge décalée sous le trait,
  petits manques d'encre, papier tramé de points.
- **Police** : Bricolage Grotesque, embarquée localement (`@fontsource/bricolage-grotesque`).
- **Mascotte** : le litchi (recette `mascot`), deux ou trois plans par vidéo au maximum, et sur chaque vignette.
  Sur fond encre, il est posé sur un support crème, comme un autocollant.

Le bloc `style` à reprendre dans chaque vidéo :

```ts
const style = {
  palettes: {
    cream: { bg: "#F3ECE0", fg: "#1C1A19", accent: "#E0485A", muted: "#A8A094", shadow: "#E0485A", screen: "#2A2622" },
    ink: { bg: "#1C1A19", fg: "#F3ECE0", accent: "#E0485A", muted: "#5E5850", shadow: "#E0485A", screen: "#2A2622" },
    accent: { bg: "#8FAE97", fg: "#1C1A19", accent: "#E0485A", muted: "#6F9179", shadow: "#E0485A", screen: "#2A2622" },
  },
  textSizes: { giant: 230, hook: 118, title: 88, body: 60, note: 34 },
  shadow: { dx: 8, dy: 7 },
  grain: 0.2,
  progressBar: true,
  riso: { wobble: 4, boil: true, speckle: true },
  series: "Psycholitchi",
};
```

Réglages utiles :

| réglage | effet |
|---|---|
| `riso.wobble` | tremblé du trait en px (0 = traits nets, 6 à 8 = plus fait main) |
| `riso.boil` | `true` : le tremblé frémit légèrement d'une image à l'autre |
| `riso.speckle` | manques d'encre et papier tramé |
| `shadow.dx` / `shadow.dy` | décalage de la couche de couleur |
| `grain` | intensité du grain papier (image fixe `public/grain.png`) |
| `textTop` | hauteur du texte en position haute (défaut 250 ; 340 pour la vignette) |

Sans `riso`, une vidéo garde le rendu d'origine (aplats et ombre dure) : les anciennes vidéos ne changent pas.

---

## La vignette : modèle fixe

Toujours la même composition : la mascotte en grand au centre, sur fond encre, avec le titre en haut.
On ne change que le titre et l'humeur du litchi (`mood`).

```tsx
style: { ...style, progressBar: false, textTop: 340 },
shots: [
  /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "Pourquoi tu ne peux pas t’empêcher de vérifier ton téléphone\u00A0?", textStyle: "title", textPos: "top", mood: "perplexe", size: "large", position: "center" },
],
```

Humeurs : `content`, `perplexe` (penché, « ? »), `surpris`, `reveur` (yeux fermés, bulle), `gene` (regard de côté, goutte).

---

## Format d'une vidéo : des recettes

Une ligne = un plan :

```ts
/* 1 */ { recipe: "phone", bg: "ink", duration: 1.6, text: "Premier mot | deuxième ligne.", screen: "unlock" },
```

- `recipe` choisit le visuel ; le moteur calcule positions, tailles et caméra.
- `bg` : fond `cream`, `ink` ou `accent` (sauge). Les couleurs des objets et du texte s'adaptent seules.
- `text` : texte affiché, révélé mot par mot. Il reprend quelques mots exacts de la voix pour le calage.
  Le signe `|` force un retour à la ligne.

Catalogue complet des recettes et de leurs options : `RECETTES.md` et `INSTRUCTIONS_PROJET_CLAUDE.md`.

---

## Organisation du projet

```
src/
  data/
    videos/            ← LES VIDÉOS : un fichier .tsx par vidéo (vidéo + vignette)
    index.tsx          ← liste des compositions du projet
    schema.ts          ← liste de tous les réglages possibles (génère le panneau du Studio)
  recipes/recipes.ts   ← les recettes de plans (format court → plan complet)
  components/
    layers/            ← calques animés (téléphone, grille, compteur, mascotte…) + registry.tsx
    svg/               ← dessins de base des objets
    text/              ← texte cinétique (révélé mot par mot)
    riso.ts            ← détection du mode risographie
  engine/              ← assemblage : plans, effet riso, transitions, caméra, timeline, planche
  theme/               ← palette par défaut, police, marges, courbes de mouvement
public/                ← fichiers statiques : texture de grain, voix off (public/voix/)
scripts/               ← commandes planche, render, synchro
RECETTES.md            ← catalogue des recettes et de leurs options
INSTRUCTIONS_PROJET_CLAUDE.md ← consignes à coller dans le Projet Claude
```

Ce qu'on modifie souvent : `src/data/videos/`, `src/data/index.tsx`, `public/voix/`.
Ce qu'on ne modifie que pour ajouter un nouvel objet ou un nouvel effet : tout le reste.

---

## Le Studio (`npm run dev`)

Choisis la vidéo dans la colonne de gauche. Colonne de droite, section **Default Props** :

- `planche` : coché, affiche la planche contact au lieu de la vidéo ;
- `style` : couleurs des trois fonds, tailles de texte, décalage de couleur, grain, effet riso,
  barre de progression, titre de série ;
- `audio` : voix off ;
- `shots` : les plans dans l'ordre, chacun avec sa recette et ses options.

Chaque modification s'enregistre automatiquement dans le fichier de la vidéo
(Cmd+Z / Ctrl+Z dans le Studio pour annuler). Le Studio réécrit alors chaque plan
sur plusieurs lignes : c'est normal.

---

## Ajouter un nouvel objet ou un nouvel effet

Quand un sujet demande un visuel qui n'existe pas (un stylo, un frigo…) :

1. dessin de l'objet dans `src/components/svg/`, avec sa version riso (trait d'encre + couche décalée,
   via `useRiso()` de `src/components/riso.ts`) ;
2. calque animé dans `src/components/layers/`, déclaré dans `layers/registry.tsx`
   et décrit dans `layerSchema` (`src/data/schema.ts`) ;
3. recette dans `src/recipes/recipes.ts`, décrite dans `recipeShotSchema` (`schema.ts`) ;
4. une ligne dans `RECETTES.md` et dans le catalogue de `INSTRUCTIONS_PROJET_CLAUDE.md`.

L'objet devient alors disponible pour toutes les vidéos suivantes.

---

## Où faire tourner le projet

- **Dans le navigateur, sans rien installer** : GitHub Codespaces. Le dossier `.devcontainer/`
  installe automatiquement tout le nécessaire à l'ouverture.
- **Sur ton ordinateur** : installer Node.js (version LTS), puis les commandes ci-dessus.

### Codespaces : bonnes pratiques

- **Consommation** : facturée au temps d'allumage × nombre de cœurs. Arrêter le Codespace en fin de séance
  (palette de commandes → « Codespaces: Stop Current Codespace ») et régler un délai de mise en veille court
  dans github.com/settings/codespaces. Garder une machine à 2 cœurs. Valider sur la planche avant de lancer
  un rendu complet.
- **Après un redémarrage**, si une commande répond « could not determine executable to run » : `npm install`.
- **Télécharger la vidéo** : le téléchargement direct d'un gros fichier coupe souvent. Lancer
  `npx http-server out -p 8000`, cliquer sur « Open in Browser » (jamais « Make Public »), télécharger
  le fichier, puis `Ctrl+C` dans le terminal pour arrêter le serveur.
- **Envoyer sur GitHub** : `git add -A`, `git commit -m "…"`, puis `git push origin main`.
  Si Git signale des branches divergentes : `git pull --no-rebase origin main`, puis `git push origin main`.
  Ne jamais utiliser `git push --force`.

---

## Déterminisme

Aucune animation n'est aléatoire au rendu : tout dépend du numéro d'image, et les placements
pseudo-aléatoires (y compris le tremblé et les manques d'encre de l'effet riso) utilisent une graine fixe.
Même fichier = même vidéo, à chaque rendu.
