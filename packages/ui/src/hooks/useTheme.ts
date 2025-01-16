import { useTheme as useThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  return useThemeContext();
};
