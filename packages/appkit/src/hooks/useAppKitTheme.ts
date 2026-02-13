import { useMemo } from 'react';
import { useSnapshot } from 'valtio';
import type { ThemeMode, ThemeVariables } from '@reown/appkit-common-react-native';
import { ThemeController } from '@reown/appkit-core-react-native';
import { useAppKitContext } from './useAppKitContext';

/**
 * Interface representing the result of the useAppKitTheme hook
 */
export interface UseAppKitThemeReturn {
  /** The current theme mode ('dark' or 'light') */
  themeMode: ThemeMode;
  /** The current theme variables, currently only supports 'accent' color */
  themeVariables: ThemeVariables;
  /** Function to set the theme mode */
  setThemeMode: (themeMode: ThemeMode | undefined) => void;
  /** Function to set theme variables */
  setThemeVariables: (themeVariables: ThemeVariables | undefined) => void;
}

/**
 * Hook to control the visual appearance of the AppKit modal
 *
 * @remarks
 * This hook provides access to the theme mode and theme variables, allowing you to
 * customize the modal's appearance. Use this hook when you need to implement dark/light
 * mode or match the modal's appearance with your application's theme.
 *
 * Currently, the only supported theme variable is `accent`, which controls the primary
 * accent color used throughout the modal interface.
 *
 * @returns {UseAppKitThemeReturn} An object containing:
 *   - `themeMode`: The current theme mode ('dark' or 'light')
 *   - `themeVariables`: The current theme variables (only 'accent' is supported)
 *   - `setThemeMode`: Function to change the theme mode
 *   - `setThemeVariables`: Function to update theme variables
 *
 * @throws {Error} If used outside of an AppKitProvider
 *
 * @example
 * ```typescript
 * import { useAppKitTheme } from '@reown/appkit-react-native';
 *
 * function MyComponent() {
 *   const { themeMode, themeVariables, setThemeMode, setThemeVariables } = useAppKitTheme();
 *
 *   // Set theme to dark mode
 *   setThemeMode('dark');
 *
 *   // Customize the accent color
 *   setThemeVariables({
 *     accent: '#00BB7F'
 *   });
 *
 *   return (
 *     <View>
 *       <Text>Current theme: {themeMode}</Text>
 *       <Text>Accent color: {themeVariables?.accent}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useAppKitTheme(): UseAppKitThemeReturn {
  useAppKitContext();

  const { themeMode, themeVariables } = useSnapshot(ThemeController.state);

  const stableFunctions = useMemo(
    () => ({
      setThemeMode: ThemeController.setDefaultThemeMode.bind(ThemeController),
      setThemeVariables: ThemeController.setThemeVariables.bind(ThemeController)
    }),
    []
  );

  return {
    themeMode,
    themeVariables,
    ...stableFunctions
  };
}
