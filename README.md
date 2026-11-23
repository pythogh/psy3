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

1. **Écriture** : dans le Projet Claude (consignes : `INSTRUCTIONS_PROJET_CLAUDE.md`),
   donne un thème → script + découpage → validation → Claude livre `src/data/videos/<id>.tsx`.
2. **Ajout au projet** : dépose le fichier dans `src/data/videos/`, puis déclare-le dans
   `src/data/index.tsx` (une ligne d'import et une balise, sur le modèle de celles déjà présentes).
3. **Validation** : `npm run planche`, puis regarde l'image produite dans `out/`.
4. **Retouches** : petites retouches dans le Studio (`npm run dev`) ; corrections importantes
   dans le Projet Claude, en citant les numéros de plans.
5. **Voix** : `npm run voix` (synthèse gratuite) ou `npm run synchro` (voix enregistrée). Les plans
   se calent sur la voix. Écoute dans le Studio, puis refais une planche si besoin.
6. **Export** : `npm run render`, puis publication.

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

La voix lit la narration de chaque plan (champ `narration`, sinon le texte affiché, sans les `|`).
Les deux commandes écrivent ensuite dans le fichier de la vidéo le début (`startAt`) et la durée
de chaque plan, et branchent l'audio. Le texte suit alors exactement la voix, pauses comprises.

**Voix de synthèse : `npm run voix`** (moteur par défaut : ElevenLabs)

Le script entier est lu en une seule fois, pour une intonation continue. ElevenLabs renvoie l'instant
de chaque mot : les plans sont calés exactement, en quelques secondes. Produit `public/voix/<id>.mp3`.

Mise en place, une seule fois :
1. Crée un compte gratuit sur elevenlabs.io, puis une clé d'API (autorisations « Text to Speech » et
   « Voices : Read »).
2. Enregistre-la comme secret Codespaces nommé `ELEVENLABS_API_KEY` (paramètres GitHub → Codespaces →
   Secrets, en l'autorisant pour ton dépôt), puis redémarre le Codespace.
   Variante : colle la clé seule dans `.voix/cle-elevenlabs.txt` (jamais envoyé sur GitHub).
3. `npm run voix -- --lister` affiche les voix de ton compte. Pour une voix française : bibliothèque de
   voix d'ElevenLabs → filtre « French » → « Add to My Voices », puis relance `--lister`.

Options ElevenLabs :

| option | effet |
|---|---|
| `--voix <identifiant>` | voix à utiliser (voir `--lister`) |
| `--stabilite 0.45` | plus bas = plus vivant et varié, plus haut = plus régulier |
| `--style 0.2` | accentuation du style de la voix (0 à 1) |
| `--vitesse 1.0` | débit, de 0.7 à 1.2 |
| `--prises 3` | 3 versions complètes, à écouter dans `public/voix/<id>-prise-N.mp3` |
| `--choix 2` | garde la prise 2 (aucun crédit consommé) |

Crédits : environ 1 crédit par caractère, soit environ 1 000 par vidéo ; l'offre gratuite en donne
10 000 par mois. Une voix déjà générée pour un texte identique est réutilisée sans rien consommer.
L'offre gratuite demande de créditer ElevenLabs dans la publication (par exemple « Voix : ElevenLabs »)
et exclut tout usage commercial.

Moteurs locaux, gratuits mais plus lents ou plus mécaniques : `--moteur chatterbox` (options
`--expressivite`, `--rythme`, `--reference`, `--prises`, `--choix 4:2,7:3`) et `--moteur kokoro`.

**Bien écrire pour la voix** : la ponctuation pilote l'intonation. Virgules pour les respirations,
points de suspension pour une phrase qui reste en l'air avant une chute, point d'interrogation pour
une montée, nombres en lettres, phrases de moins de 20 mots, pas de points d'exclamation.
Le champ `narration` d'un plan permet de ponctuer pour l'oreille sans changer le texte affiché.

**Voix enregistrée : `npm run synchro`**
1. Dépose le fichier dans `public/voix/<id>.mp3` (ou `.wav`, `.m4a`).
2. `npm run synchro` : Whisper (transcription locale, gratuite) repère chaque mot et cale les plans.
- Pour un autre nom de fichier : `npm run synchro -- <id> --audio public/voix/fichier.mp3`.
- Premier lancement : compilation de Whisper et téléchargement de son modèle (plusieurs minutes, environ 500 Mo).
- L'enregistrement doit lire le texte des plans ; de petites différences ne gênent pas.

Les deux commandes réécrivent le bloc des plans de la vidéo (comme le Studio) : les commentaires
qui s'y trouvaient, comme les numéros `/* 12 */`, disparaissent. Après une modification du texte,
relance simplement la commande.

Pour caler à la main : ajuste `duration`, ou renseigne `startAt` (seconde où le plan commence).

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
