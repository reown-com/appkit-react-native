import { Appearance } from 'react-native';
import { ThemeController } from '../../index';

// Mock react-native Appearance
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn()
  }
}));

const mockedAppearance = Appearance as jest.Mocked<typeof Appearance>;

// -- Tests --------------------------------------------------------------------
describe('ThemeController', () => {
  beforeEach(() => {
    // Reset state before each test
    ThemeController.setThemeMode();
    ThemeController.setDefaultThemeMode();
    ThemeController.setThemeVariables();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have valid default state', () => {
      expect(ThemeController.state.themeMode).toBeDefined();
      expect(ThemeController.state.defaultThemeMode).toBeUndefined();
      expect(ThemeController.state.themeVariables).toEqual({});
    });
  });

  describe('setThemeMode', () => {
    it('should set theme mode to light', () => {
      ThemeController.setThemeMode('light');
      expect(ThemeController.state.themeMode).toBe('light');
    });

    it('should set theme mode to dark', () => {
      ThemeController.setThemeMode('dark');
      expect(ThemeController.state.themeMode).toBe('dark');
    });

    it('should fall back to system theme when undefined and system is dark', () => {
      mockedAppearance.getColorScheme.mockReturnValue('dark');
      ThemeController.setThemeMode();
      expect(ThemeController.state.themeMode).toBe('dark');
      expect(mockedAppearance.getColorScheme).toHaveBeenCalled();
    });

    it('should fall back to system theme when undefined and system is light', () => {
      mockedAppearance.getColorScheme.mockReturnValue('light');
      ThemeController.setThemeMode();
      expect(ThemeController.state.themeMode).toBe('light');
      expect(mockedAppearance.getColorScheme).toHaveBeenCalled();
    });

    it('should default to light when system returns null', () => {
      mockedAppearance.getColorScheme.mockReturnValue(null);
      ThemeController.setThemeMode();
      expect(ThemeController.state.themeMode).toBe('light');
    });
  });

  describe('setDefaultThemeMode', () => {
    it('should set default theme mode and apply it', () => {
      ThemeController.setDefaultThemeMode('dark');
      expect(ThemeController.state.defaultThemeMode).toBe('dark');
      expect(ThemeController.state.themeMode).toBe('dark');
    });

    it('should set default theme mode to light and apply it', () => {
      ThemeController.setDefaultThemeMode('light');
      expect(ThemeController.state.defaultThemeMode).toBe('light');
      expect(ThemeController.state.themeMode).toBe('light');
    });

    it('should set default theme mode to undefined and fall back to system', () => {
      mockedAppearance.getColorScheme.mockReturnValue('dark');
      ThemeController.setDefaultThemeMode();
      expect(ThemeController.state.defaultThemeMode).toBeUndefined();
      expect(ThemeController.state.themeMode).toBe('dark');
    });
  });

  describe('setThemeVariables', () => {
    it('should set theme variables', () => {
      const variables = { accent: '#000000' };
      ThemeController.setThemeVariables(variables);
      expect(ThemeController.state.themeVariables).toEqual(variables);
    });

    it('should override existing theme variables', () => {
      const initialVariables = { accent: '#000000' };
      const newVariables = { accent: '#FFFFFF' };

      ThemeController.setThemeVariables(initialVariables);
      ThemeController.setThemeVariables(newVariables);

      expect(ThemeController.state.themeVariables).toEqual({
        accent: '#FFFFFF'
      });
    });

    it('should reset theme variables when undefined', () => {
      const variables = { accent: '#000000' };
      ThemeController.setThemeVariables(variables);
      expect(ThemeController.state.themeVariables).toEqual(variables);

      ThemeController.setThemeVariables(undefined);
      expect(ThemeController.state.themeVariables).toEqual({});
    });

    it('should handle empty object', () => {
      ThemeController.setThemeVariables({});
      expect(ThemeController.state.themeVariables).toEqual({});
    });
  });

  describe('subscribe', () => {
    it('should return an unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = ThemeController.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should have subscribe method defined', () => {
      expect(ThemeController.subscribe).toBeDefined();
      expect(typeof ThemeController.subscribe).toBe('function');
    });
  });

  describe('state immutability', () => {
    it('should maintain state reference but update values', () => {
      const stateRef = ThemeController.state;
      ThemeController.setThemeMode('dark');
      expect(ThemeController.state).toBe(stateRef);
      expect(ThemeController.state.themeMode).toBe('dark');
    });
  });
});
