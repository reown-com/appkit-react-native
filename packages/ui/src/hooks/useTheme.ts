import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '../utils/ThemeUtil';

function useTheme() {
  const scheme = useColorScheme();
  const Theme = scheme === 'dark' ? DarkTheme : LightTheme;

  // How to return customized theme? quizas wrappear el componente con un provider
  // if (accentColor) return Object.assign(Theme, { accent: accentColor });

  return Theme;
}

export default useTheme;
