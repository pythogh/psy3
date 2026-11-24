# Psycholitchi (psy-motion)

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
npm install                  # une fois, au début (et après un redémarrage du Codespace si besoin)
npm run dev                  # Studio : aperçu + panneau de réglages
npm run verifier -- <id>     # code + calage des plans sur la voix + planche
npm run export -- <id>       # vidéo (out/<id>.mp4) + vignette (out/<id>-vignette.png)
npm run telecharger          # ouvre le dossier out/ dans le navigateur pour télécharger
```

Commandes unitaires, si besoin : `npm run synchro -- <id>`, `npm run planche -- <id>`,
`npm run render -- <id>`, `npm run vignette -- <id>`, `npx tsc --noEmit`.

`<id>` est l'identifiant de la vidéo, écrit dans son fichier (`id="..."`). S'il n'y a qu'une vidéo
dans le projet, on peut l'omettre. Si le fichier audio n'a pas le nom attendu :
`npm run verifier -- <id> --audio public/voix/<fichier>.wav`.

---

## Checklist d'une vidéo

1. Projet Claude : thème → script validé → fichier `src/data/videos/<id>.tsx`.
2. Déposer le fichier dans `src/data/videos/` et déclarer ses deux compositions dans `src/data/index.tsx`.
3. Enregistrer la voix (cliputils.com ou ta voix) en lisant le script tel quel → `public/voix/<id>.wav`.
4. `npm run verifier -- <id>` → ouvrir `out/<id>-planche.png`. Corrections dans le Projet Claude, par numéro de plan.
5. `npm run export -- <id>`.
6. `npm run telecharger` → « Open in Browser » → télécharger la vidéo et la vignette → `Ctrl+C`.
7. `git add -A`, `git commit -m "Vidéo <id>"`, `git push origin main`.
8. Arrêter le Codespace.
9. TikTok : importer la vidéo, choisir la vignette comme couverture, ajouter la musique de fond.

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
4. **Voix** : génère la voix sur cliputils.com (ou enregistre ta voix) en lisant le script tel quel,
   puis dépose le fichier dans `public/voix/<id>.wav`.
5. **Calage et validation** : `npm run verifier -- <id>`. Corrections dans le Projet Claude, en citant les numéros
   de plans. Après une synchro, ne remplacer que les blocs modifiés, pour garder les calages.
6. **Export** : `npm run export -- <id>`, puis `npm run telecharger`.
7. **Publication** : la musique de fond s'ajoute dans TikTok au moment de publier, pas dans le projet.

---

## Direction artistique : risographie et ligne organique

- **Palette** : crème, encre et vert sauge, avec le rouge litchi comme seule couleur d'accent.
- **Effet riso** : trait d'encre légèrement tremblé, couche de couleur rouge décalée sous le trait,
  petits manques d'encre, papier tramé de points.
- **Police** : Bricolage Grotesque, embarquée localement (`@fontsource/bricolage-grotesque`).
- **Mascotte** : le litchi (recette `mascot`), deux ou trois plans par vidéo au maximum, et sur chaque vignette.
  Sur fond encre, il est posé sur un support crème, comme un autocollant.

Le bloc `style` à reprendre dans chaque vidéo, écrit en clair dans les `defaultProps` (pas de constante ni de raccourci : sinon `npm run synchro` et le Studio ne peuvent pas réécrire le fichier) :

```ts
style: {
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
},
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
style: { /* même style que la vidéo, avec */ progressBar: false, textTop: 340 /* … */ },
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
scripts/               ← commandes (run.mjs : planche, render, vignette, export, verifier, telecharger ; synchro.mjs)
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
  `npm run telecharger`, cliquer sur « Open in Browser » (jamais « Make Public »), télécharger
  les fichiers, puis `Ctrl+C` dans le terminal pour arrêter le serveur.
- **Envoyer sur GitHub** : `git add -A`, `git commit -m "…"`, puis `git push origin main`.
  Si Git signale des branches divergentes : `git pull --no-rebase origin main`, puis `git push origin main`.
  Ne jamais utiliser `git push --force`.

---

## Déterminisme

Aucune animation n'est aléatoire au rendu : tout dépend du numéro d'image, et les placements
pseudo-aléatoires (y compris le tremblé et les manques d'encre de l'effet riso) utilisent une graine fixe.
Même fichier = même vidéo, à chaque rendu.
