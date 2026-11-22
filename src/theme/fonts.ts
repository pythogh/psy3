// Police embarquée localement (aucun appel réseau au rendu).
import "@fontsource/schibsted-grotesk/latin-400.css";
import "@fontsource/schibsted-grotesk/latin-500.css";
import "@fontsource/schibsted-grotesk/latin-700.css";
import "@fontsource/schibsted-grotesk/latin-800.css";
import { continueRender, delayRender } from "remotion";

// On bloque le rendu tant que la police n'est pas chargée, sinon les premières
// frames seraient rendues avec la police de secours.
const handle = delayRender("Chargement de Schibsted Grotesk");
Promise.all(
  ["400", "500", "700", "800"].map((w) => document.fonts.load(`${w} 64px "Schibsted Grotesk"`)),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
