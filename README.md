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
npm run voix         # voix off gratuite (synthèse locale) + calage automatique des plans
npm run synchro      # voix enregistrée (la tienne, ElevenLabs…) → calage automatique des plans
npm run render       # export MP4 → out/<id>.mp4
```

`<id>` est l'identifiant de la vidéo, écrit dans son fichier (`id="..."`).
S'il y a plusieurs vidéos dans le projet, précise laquelle :
`npm run planche -- <id>`, `npm run voix -- <id>`, etc.

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
public/                ← fichiers statiques : texture de grain, voix off (public/voix/)
.voix/                 ← outils de voix installés automatiquement (non envoyé sur GitHub)
scripts/               ← commandes planche, render, voix, synchro
RECETTES.md            ← catalogue des recettes et de leurs options
INSTRUCTIONS_PROJET_CLAUDE.md ← consignes à coller dans un Projet Claude
```

Ce qu'on modifie souvent : `src/data/videos/`, `src/data/index.tsx`, `public/` (voix off).
Ce qu'on ne modifie que pour ajouter un nouvel objet ou un nouvel effet : tout le reste.

---

## Fabriquer une vidéo

1. **Script** : dans le Projet Claude (consignes : `INSTRUCTIONS_PROJET_CLAUDE.md`), donne un thème
   → Claude livre `src/data/videos/<id>.tsx` avec le script dit et aucun plan.
2. **Ajout au projet** : dépose le fichier dans `src/data/videos/`, puis déclare-le dans
   `src/data/index.tsx` (une ligne d'import et une balise, sur le modèle de celles déjà présentes).
3. **Voix** : `npm run voix -- <id>`, écoute, corrige le script, relance (voir « Voix off »).
4. **Découpage** : audio validé → Claude renvoie le bloc des plans, à coller dans `shots`.
5. **Calage et validation** : `npm run voix -- <id>` (0 crédit), puis `npm run planche -- <id>`.
6. **Retouches** : petites retouches dans le Studio (`npm run dev`) ; corrections importantes
   dans le Projet Claude, en citant les numéros de plans.
7. **Export** : `npm run render -- <id>`, puis publication.

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

## Voix off : d'abord la voix, ensuite les images

La vidéo a deux textes distincts :
- **`script`** : le texte DIT par la voix, un paragraphe par ligne, écrit pour l'oreille ;
- **`text` de chaque plan** : le texte AFFICHÉ, court, qui reprend quelques mots du script.

Ordre de travail :
1. Le Projet Claude écrit le script → fichier de la vidéo avec `script` rempli et `shots: []`.
2. `npm run voix -- --voix Atma` : génère la voix. Écoute `public/voix/<id>.wav`, corrige le script
   dans le fichier, relance : seuls les paragraphes modifiés sont régénérés.
3. Audio validé → le Projet Claude fait le découpage (bloc `shots` à coller).
4. `npm run voix` : l'audio est en cache (0 crédit), les plans sont calés sur la voix.
5. `npm run planche`, puis `npm run render`.

**Mise en place ElevenLabs (une fois)** : compte gratuit sur elevenlabs.io, clé d'API (autorisations
« Text to Speech » et « Voices : Read »), enregistrée comme secret Codespaces `ELEVENLABS_API_KEY`
(puis redémarrer le Codespace) ou collée seule dans `.voix/cle-elevenlabs.txt`.

**Options de `npm run voix`** :

| option | effet |
|---|---|
| `--lister` | voix de ton compte ; ✓ = utilisable avec le compte gratuit |
| `--voix Atma` | voix à utiliser (nom ou identifiant) ; enregistrée dans la vidéo pour la suite |
| `--essai` | génère seulement le 1er paragraphe → `public/voix/essai-<voix>-<réglages>.wav` (≈ 200 crédits) |
| `--essai "Une phrase."` | génère seulement cette phrase |
| `--stabilite 0.45` | plus bas = plus vivant et varié, plus haut = plus régulier |
| `--style 0.2` | accentuation du style de la voix (0 à 1) |
| `--vitesse 1.0` | débit, de 0.7 à 1.2 |
| `--prise 2` | autre version de chaque paragraphe (nouvelle génération) |
| `--oui` | ne pas demander confirmation avant de consommer des crédits |

Les réglages utilisés sont enregistrés dans le champ `voix` de la vidéo (modifiable dans le Studio) :
les lancements suivants les reprennent sans option.

**Économiser les crédits** (≈ 1 crédit par caractère, 10 000 par mois en gratuit) : la commande affiche
le coût et demande confirmation avant toute génération payante ; régler la voix
et les réglages avec `--essai` ; ne corriger que les paragraphes nécessaires ; une génération déjà faite
(même texte, même voix, mêmes réglages) est réutilisée sans rien consommer, même d'une vidéo à l'autre.
L'offre gratuite demande de créditer ElevenLabs (« Voix : ElevenLabs ») et exclut tout usage commercial.

**Autres sources de voix** :
- `npm run synchro` : une voix enregistrée ailleurs, déposée dans `public/voix/<id>.mp3`, calée par Whisper.
- `--moteur chatterbox` ou `--moteur kokoro` : synthèse locale gratuite, plus lente ou plus mécanique.

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
