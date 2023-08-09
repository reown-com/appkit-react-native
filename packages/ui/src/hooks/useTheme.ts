import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '../utils/ThemeUtil';

function useTheme() {
  const scheme = useColorScheme();
  const Theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return Theme;
}

export default useTheme;
