import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
// Pour utiliser un Chrome déjà installé plutôt que celui que Remotion télécharge :
// Config.setBrowserExecutable("/chemin/vers/chrome-headless-shell");
