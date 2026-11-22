import React, { createContext, useContext } from "react";
import { baseTheme, Palette, Theme } from "./theme";

const ThemeContext = createContext<Theme>(baseTheme);
const PaletteContext = createContext<Palette>(baseTheme.palettes.cream);

export const ThemeProvider: React.FC<{ theme: Theme; children: React.ReactNode }> = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);
export const PaletteProvider: React.FC<{ palette: Palette; children: React.ReactNode }> = ({ palette, children }) => (
  <PaletteContext.Provider value={palette}>{children}</PaletteContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
/** Couleurs du plan en cours (dépendent de son fond). */
export const usePalette = () => useContext(PaletteContext);
