# Recettes de plans

Une vidéo est une liste de plans. Chaque plan est une ligne :

```ts
{ recipe: "phone", bg: "ink", duration: 1.6, text: "Tu déverrouilles | ton téléphone.", screen: "unlock" },
```

Le moteur calcule seul les positions, les tailles et la caméra. Le signe `|` force un retour à la ligne.

## Champs communs à toutes les recettes

| champ | valeurs | défaut |
|---|---|---|
| `recipe` | voir le catalogue | obligatoire |
| `text` | texte affiché, révélé mot par mot | obligatoire |
| `duration` | secondes (1 à 3,5 conseillé) | obligatoire |
| `bg` | `cream`, `ink`, `accent` | `cream` |
| `enter` | `cut`, `slam`, `fade`, `rise`, `slide`, `zoom`, `wipe` | `cut` |
| `camera` | `push` (avance), `pull` (recule), `still`, `drift` (glisse), `punch` (coup de zoom) | `push` (`pull` pour words) |
| `textStyle` | `giant`, `hook`, `title`, `body` | auto : giant pour words, title au-delà de 7 mots, sinon hook |
| `textPos` | `top`, `center`, `bottom` | `center` pour words, sinon `bottom` |
| `decor` | `none`, `circle`, `ring`, `dashedRing`, `square` | `circle` pour words, sinon `none` |
| `shadow` | `false` pour retirer les ombres sur ce plan uniquement | ombres actives |
| `narration` | texte de la voix off s'il diffère du texte affiché | le texte |
| `startAt` | seconde de la voix off où commence le plan | — |

Avec `textPos: "top"`, le visuel descend automatiquement dans la moitié basse.

## Catalogue

| recette | ce qu'on voit | options |
|---|---|---|
| `phone` | un téléphone | `screen` : off, on, unlock, flash · `motion` : float, drop, pop, shake, none · `notify` : true |
| `phoneRow` | 2 à 5 téléphones qui s'allument à tour de rôle, de plus en plus vite | `count` |
| `phoneGrid` | 8 téléphones vérifiés un par un, rares notifications | `pace` : slow, fast · `rewards` : 0 à 4 |
| `counter` | grand compteur qui défile dans un cercle | `to` (obligatoire), `from`, `suffix` (ex. " s") |
| `words` | le texte seul, en géant, sur une grande forme | — |
| `pattern` | grille de cases : régulière (habitude) ou imprévisible (incertitude) | `mode` : sequence, irregular · `rewards` : 0 à 1 · `close` : true · `seed` |
| `dot` | un point orange | `mode` : fill (plein), empty (contour), fillToEmpty (se vide) |
| `ground` | un téléphone qui surgit d'une ligne, mécaniquement | `pace` : slow, fast |
| `context` | un décor surgit, puis le téléphone juste après | `kind` : elevator, queue, hourglass |
| `reach` | un bras surgit et saisit le téléphone | — |
| `timeline` | une journée : beaucoup de segments très courts | `part` : start, end, all |
| `custom` | mode expert : calques détaillés | `layers`, `cameraDetail` |

Deux plans `pattern` consécutifs avec la même `seed` montrent la même grille : utile pour couper une phrase en deux
sans changer d'image (le second avec `close: true` pour resserrer).

## Règles de montage qui marchent

- Un plan par segment de 3 à 8 mots. Environ 30 plans pour une minute.
- Durée d'un plan ≈ nombre de mots ÷ 2,4 + 0,3 s.
- Alterner les fonds ; éviter trois fois la même recette d'affilée.
- `slam` pour les coupes nettes, `wipe` / `slide` / `rise` pour changer de partie, `fade` pour la conclusion.
- `giant` : 1 à 3 mots par ligne, pas plus de 4 lignes.
