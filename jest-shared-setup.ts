// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native modules that cause issues with Flow types
jest.mock('react-native', () => {
  return {
    StyleSheet: {
      create: (styles: Record<string, any>) => styles,
      hairlineWidth: 1,
      absoluteFill: {},
      flatten: jest.fn()
    },
    Dimensions: {
      get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    },
    Platform: {
      OS: 'ios',
      select: jest.fn().mockImplementation((obj: { ios?: any; android?: any }) => obj.ios)
    },
    NativeModules: {
      StatusBarManager: { height: 44 }
    },
    Text: 'Text',
    View: 'View',
    TouchableOpacity: 'TouchableOpacity',
    TouchableWithoutFeedback: 'TouchableWithoutFeedback',
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    Image: 'Image',
    Animated: {
      View: 'Animated.View',
      createAnimatedComponent: (component: string) => `Animated.${component}`,
      timing: jest.fn().mockReturnValue({ start: jest.fn() }),
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
        setValue: jest.fn()
      }))
    },
    I18nManager: {
      isRTL: false
    },
    useColorScheme: jest.fn().mockReturnValue('light')
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const mockSvg = () => 'Svg';
  mockSvg.Circle = () => 'Circle';
  mockSvg.Rect = () => 'Rect';
  mockSvg.Path = () => 'Path';
  mockSvg.G = () => 'G';
  mockSvg.Defs = () => 'Defs';
  mockSvg.LinearGradient = () => 'LinearGradient';
  mockSvg.Stop = () => 'Stop';

  return mockSvg;
});

// Export a function to mock package-specific modules
export const mockThemeContext = (modulePath: string) => {
  jest.mock(
    modulePath,
    () => ({
      ThemeContext: {
        Provider: ({ children }: { children: React.ReactNode }) => children,
        Consumer: ({ children }: { children: Function }) => children({ themeMode: 'light' })
      },
      useTheme: jest.fn().mockReturnValue({
        themeMode: 'light',
        colors: {
          text: '#000000',
          background: '#FFFFFF',
          primary: '#3396FF'
        }
      })
    }),
    { virtual: true }
  );
};

export const mockUseTheme = (modulePath: string) => {
  jest.mock(
    modulePath,
    () => ({
      useTheme: jest.fn().mockReturnValue({
        themeMode: 'light',
        colors: {
          text: '#000000',
          background: '#FFFFFF',
          primary: '#3396FF'
        }
      })
    }),
    { virtual: true }
  );
};
