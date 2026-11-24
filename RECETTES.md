# Recettes de plans

Une vidéo est une liste de plans. Chaque plan est une ligne :

```ts
/* 1 */ { recipe: "phone", bg: "ink", duration: 1.6, text: "Tu déverrouilles | ton téléphone.", screen: "unlock" },
```

Le moteur calcule seul les positions, les tailles et la caméra. Le signe `|` force un retour à la ligne.
Avec le réglage `riso` du style (DA Psycholitchi), tous les visuels sont dessinés en trait d'encre tremblé,
avec une couche de couleur rouge décalée : rien à préciser plan par plan.

## Champs communs à toutes les recettes

| champ | valeurs | défaut |
|---|---|---|
| `recipe` | voir le catalogue | obligatoire |
| `text` | texte affiché, révélé mot par mot ; reprend deux ou trois mots exacts de la voix (calage Whisper) | obligatoire |
| `duration` | secondes, indicative : remplacée par `npm run synchro` | obligatoire |
| `bg` | `cream` (crème), `ink` (encre), `accent` (vert sauge) | `cream` |
| `enter` | `cut`, `slam`, `fade`, `rise`, `slide`, `zoom`, `wipe` | `cut` |
| `camera` | `push` (avance), `pull` (recule), `still`, `drift` (glisse), `punch` (coup de zoom) | `push` (`pull` pour words, `still` pour mascot) |
| `textStyle` | `giant`, `hook`, `title`, `body`, `term` (notion clé sur une étiquette crème, une ou deux fois par vidéo) | auto : giant pour words, title au-delà de 7 mots, sinon hook |
| `textPos` | `top`, `center`, `bottom` | `center` pour words, `top` pour mascot en `position: "bottom"`, sinon `bottom` |
| `decor` | `none`, `circle`, `ring`, `dashedRing`, `square` | `circle` pour words, sinon `none` |
| `shadow` | `false` pour retirer les ombres sur ce plan uniquement | ombres actives |
| `narration` | repère de voix off, non utilisé avec la synchro | le texte |
| `startAt` | seconde de la voix off où commence le plan, écrite par `npm run synchro` | — |

Avec `textPos: "top"`, le visuel descend automatiquement dans la moitié basse.

## Catalogue

| recette | ce qu'on voit | options |
|---|---|---|
| `phone` | un téléphone | `screen` : off, on, unlock, flash · `motion` : float, drop, pop, shake, none · `notify` : true |
| `phoneRow` | 2 à 5 téléphones qui s'allument à tour de rôle, de plus en plus vite | `count` |
| `phoneGrid` | 8 téléphones vérifiés un par un, rares notifications | `pace` : slow, fast · `rewards` : 0 à 4 |
| `counter` | grand compteur qui défile dans un cercle | `to` (obligatoire), `from`, `suffix` (ex. " s") |
| `words` | le texte seul, en géant, sur une grande forme | — |
| `pattern` | grille de cases : régulière (habitude) ou imprévisible (incertitude) | `mode` : sequence, irregular · `rewards` : 0 à 1 · `seed` |
| `dot` | un point de couleur d'accent | `mode` : fill (plein), empty (contour), fillToEmpty (se vide) |
| `ground` | un téléphone qui surgit d'une ligne, mécaniquement | `pace` : slow, fast |
| `context` | un décor seul, centré, qui surgit du sol | `kind` : elevator, queue |
| `mascot` | la mascotte : un litchi en risographie (couche rouge décalée sous un trait d'encre, écailles, petite tige sèche), qui apparaît en fondu puis flotte doucement | `mood` : content, perplexe (penché, « ? »), surpris, reveur (yeux fermés, bulle), gene (regard de côté, goutte) · `size` : small, medium, large · `position` : center, bottom (texte en haut), corner (petite, dans un coin) |
| `custom` | mode expert : calques détaillés (ex. mascotte combinée à un autre objet) | `layers`, `cameraDetail` |

Deux plans `pattern` consécutifs avec la même `seed` montrent la même grille : utile pour couper une phrase en deux
sans changer d'image.

Exemple de plan mascotte :

```ts
/* 4 */ { recipe: "mascot", bg: "cream", duration: 1.6, text: "Et pourtant… | tu recommences.", mood: "perplexe" },
```

Sur fond `ink`, le litchi est posé sur un support crème, comme un autocollant.

## Vignette : modèle fixe

Composition `<id>-vignette`, un seul plan, toujours identique : seuls changent le titre et l'humeur du litchi.

```ts
style: { ...style, progressBar: false, textTop: 340 },
shots: [
  /* 0 */ { recipe: "mascot", bg: "ink", duration: 2, text: "<titre de la vignette>\u00A0?", textStyle: "title", textPos: "top", mood: "<humeur>", size: "large", position: "center" },
],
```

Export : `npx remotion still src/index.ts <id>-vignette out/<id>-vignette.png --frame=40`.

## À éviter (rendu jugé raté)

- `reach` (le bras) ;
- `context` avec `kind: "hourglass"` (le sablier) ;
- `timeline` (barres mal posées sur l'axe) ;
- `pattern` avec `close: true` (la grille déborde en haut à gauche) ;
- un `decor` (circle, ring, dashedRing) derrière un texte de la même couleur : mettre `decor: "none"` sur words ;
- plus de deux ou trois plans `mascot` par vidéo.

## Règles de montage qui marchent

- Un plan par segment de 3 à 8 mots. 25 à 36 plans pour une minute.
- Durée indicative d'un plan ≈ nombre de mots affichés ÷ 2,4, minimum 0,9 s ; le dernier plan dure 3 à 4 s.
- Alterner les fonds ; éviter trois fois la même recette d'affilée.
- `slam` pour les coupes nettes, `wipe` / `slide` / `rise` pour changer de partie, `fade` pour la conclusion.
- `giant` : 1 à 3 mots par ligne, pas plus de 4 lignes.
- Mascotte plutôt aux moments où le spectateur se reconnaît.
