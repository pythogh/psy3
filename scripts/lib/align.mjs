// Aligne les mots de la narration (plan par plan) sur les mots transcrits par Whisper,
// pour trouver à quelle seconde commence chaque plan dans l'audio.
// Alignement global (type Needleman-Wunsch) : robuste aux mots mal transcrits, oubliés ou ajoutés.

/** Normalise un texte en liste de mots comparables (minuscules, sans accents ni ponctuation). */
export const words = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`]/g, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const levenshtein = (a, b) => {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
};

const similar = (a, b) => {
  if (a === b) return true;
  const longest = Math.max(a.length, b.length);
  return longest >= 4 && levenshtein(a, b) / longest <= 0.25;
};

/**
 * @param segments  texte de narration de chaque plan
 * @param heard     mots transcrits : [{ text, start }] (start en secondes), dans l'ordre
 * @returns         { starts: début de chaque plan (s), matched: proportion de mots retrouvés }
 */
export const alignSegments = (segments, heard) => {
  const script = [];
  segments.forEach((seg, s) => words(seg).forEach((w) => script.push({ w, s })));
  const spoken = [];
  heard.forEach((h) => words(h.text).forEach((w) => spoken.push({ w, t: h.start })));

  const n = script.length;
  const m = spoken.length;
  const GAP = -1;
  const score = new Float32Array((n + 1) * (m + 1));
  const at = (i, j) => i * (m + 1) + j;
  for (let i = 1; i <= n; i++) score[at(i, 0)] = i * GAP;
  for (let j = 1; j <= m; j++) score[at(0, j)] = j * GAP;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = score[at(i - 1, j - 1)] + (similar(script[i - 1].w, spoken[j - 1].w) ? 2 : -1);
      score[at(i, j)] = Math.max(diag, score[at(i - 1, j)] + GAP, score[at(i, j - 1)] + GAP);
    }
  }
  // Remontée : quel mot transcrit correspond à quel mot du script
  const match = new Array(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const ok = similar(script[i - 1].w, spoken[j - 1].w);
    if (ok && score[at(i, j)] === score[at(i - 1, j - 1)] + 2) {
      match[i - 1] = j - 1;
      i--, j--;
    } else if (score[at(i, j)] === score[at(i - 1, j)] + GAP) i--;
    else if (score[at(i, j)] === score[at(i, j - 1)] + GAP) j--;
    else i--, j--;
  }

  // Début de chaque plan : premier mot retrouvé du plan, corrigé du nombre de mots qui le précèdent
  const starts = new Array(segments.length).fill(undefined);
  const wordsPerSecond = 2.6;
  segments.forEach((_, s) => {
    const idx = script.findIndex((x, k) => x.s === s && match[k] >= 0);
    if (idx < 0) return;
    const firstOfSegment = script.findIndex((x) => x.s === s);
    starts[s] = Math.max(0, spoken[match[idx]].t - (idx - firstOfSegment) / wordsPerSecond);
  });
  // Plans sans aucun mot retrouvé : interpolation entre les voisins
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] !== undefined) continue;
    let a = s - 1;
    while (a >= 0 && starts[a] === undefined) a--;
    let b = s + 1;
    while (b < starts.length && starts[b] === undefined) b++;
    const ta = a >= 0 ? starts[a] : 0;
    const tb = b < starts.length ? starts[b] : ta + 2 * (s - a);
    starts[s] = ta + ((tb - ta) * (s - a)) / (b - a);
  }
  // Garantit un ordre croissant avec au moins 0,3 s par plan
  for (let s = 1; s < starts.length; s++) starts[s] = Math.max(starts[s], starts[s - 1] + 0.3);
  const matched = match.filter((x) => x >= 0).length / Math.max(1, n);
  return { starts, matched };
};
