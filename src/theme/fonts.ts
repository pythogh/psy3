// Police embarquée localement (aucun appel réseau au rendu).
import "@fontsource/bricolage-grotesque/latin-400.css";
import "@fontsource/bricolage-grotesque/latin-500.css";
import "@fontsource/bricolage-grotesque/latin-600.css";
import "@fontsource/bricolage-grotesque/latin-700.css";
import "@fontsource/bricolage-grotesque/latin-800.css";
import { continueRender, delayRender } from "remotion";

// On bloque le rendu tant que la police n'est pas chargée, sinon les premières
// frames seraient rendues avec la police de secours.
const handle = delayRender("Chargement de Bricolage Grotesque");
Promise.all(
  ["400", "500", "600", "700", "800"].map((w) => document.fonts.load(`${w} 64px "Bricolage Grotesque"`)),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
