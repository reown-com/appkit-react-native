import { useColorScheme } from 'react-native';
import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeMode, ThemeVariables } from '@reown/appkit-common-react-native';

import { DarkTheme, LightTheme, getAccentColors } from '../utils/ThemeUtil';

type ThemeContextType = {
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  themeMode?: ThemeMode;
  themeVariables?: ThemeVariables;
}

export function ThemeProvider({ children, themeMode, themeVariables }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ themeMode, themeVariables }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const scheme = useColorScheme();

  // If the theme mode is not set, use the system color scheme
  const themeMode = context?.themeMode ?? scheme;
  const themeVariables = context?.themeVariables ?? {};

  let Theme = themeMode === 'dark' ? DarkTheme : LightTheme;

  if (themeVariables.accent) {
    Theme = {
      ...Theme,
      ...getAccentColors(themeVariables.accent)
    };
  }

  return Theme;
}
