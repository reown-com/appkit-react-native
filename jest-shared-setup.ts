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
    Linking: {
      canOpenURL: jest.fn().mockResolvedValue(false),
      openURL: jest.fn().mockResolvedValue(undefined)
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

// -- Core controller state reset ------------------------------------------------ //
const CORE_CONTROLLERS = [
  'ApiController',
  'AssetController',
  'BlockchainApiController',
  'ConnectionsController',
  'EnsController',
  'EventsController',
  'LogController',
  'ModalController',
  'OnRampController',
  'OptionsController',
  'PublicStateController',
  'RouterController',
  'SendController',
  'SnackController',
  'SwapController',
  'ThemeController',
  'TransactionsController',
  'WcController'
] as const;

type ControllerState = Record<string, unknown>;

const controllerPath = (name: string) =>
  require('path').join(__dirname, 'packages/core/src/controllers', name);

const getControllerState = (moduleExports: any, name: string): ControllerState | undefined => {
  const state = moduleExports?.[name]?.state;

  return state && typeof state === 'object' ? state : undefined;
};

// Copies plain objects, arrays and Maps so tests can't mutate the captured initial values
const cloneValue = (value: unknown): unknown => {
  if (value instanceof Map) return new Map(value);
  if (Array.isArray(value)) return value.map(cloneValue);
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cloneValue(v)]));
  }

  return value;
};

let initialControllerStates: Map<string, ControllerState> | undefined;

// Loads a fresh, untouched copy of every controller (with this test file's mocks applied)
// and records its state, so the live controllers can be restored to it
const getInitialControllerStates = () => {
  if (initialControllerStates) return initialControllerStates;

  const states = new Map<string, ControllerState>();

  jest.isolateModules(() => {
    // Must be the same (isolated) valtio instance that created the fresh proxies
    const { getVersion, snapshot } = require('valtio');
    CORE_CONTROLLERS.forEach(name => {
      const state = getControllerState(require(controllerPath(name)), name);
      // Skip controllers the test file replaced with a mock (no valtio proxy)
      if (state && getVersion(state) !== undefined) {
        states.set(name, cloneValue(snapshot(state)) as ControllerState);
      }
    });
  });

  initialControllerStates = states;

  return states;
};

/**
 * Restores the state of every core valtio controller to the value it had when the module
 * was first loaded. Use it in `afterEach` so state set by one test doesn't leak into the next.
 */
export const resetControllers = () => {
  const initialStates = getInitialControllerStates();

  CORE_CONTROLLERS.forEach(name => {
    const initial = initialStates.get(name);
    const state = getControllerState(require(controllerPath(name)), name);
    if (!initial || !state) return;

    Object.keys(state).forEach(key => {
      if (!(key in initial)) delete state[key];
    });
    Object.entries(initial).forEach(([key, value]) => {
      state[key] = cloneValue(value);
    });
  });
};
