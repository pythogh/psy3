import { useTheme } from "../theme/ThemeContext";

/*
 * Mode risographie : actif quand le style d'une vidéo contient riso (wobble > 0 ou speckle).
 * Les composants dessinent alors un trait d'encre sans remplissage, avec une couche de
 * couleur décalée en dessous (couleur « shadow » de la palette).
 */
export const useRiso = () => {
  const theme = useTheme();
  const r = theme.riso;
  const on = !!r && (r.wobble > 0 || r.speckle);
  return { on, dx: theme.shadow.dx, dy: theme.shadow.dy };
};

/** Vrai si une couleur hexadécimale est sombre (pour choisir la couleur d'un écran allumé). */
export const isDark = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
};
