import { ThemeController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('ThemeController', () => {
  beforeEach(() => {
    // Reset state
    ThemeController.setDefaultThemeMode(undefined);
    ThemeController.setSystemThemeMode();
    ThemeController.setThemeVariables(undefined);
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have valid default state', () => {
      const state = ThemeController.state;
      expect(state.themeMode).toBeDefined();
      expect(state.defaultThemeMode).toBeUndefined();
      expect(state.themeVariables).toEqual({});
    });
  });

  describe('setDefaultThemeMode', () => {
    it('should set default theme mode to light', () => {
      ThemeController.setDefaultThemeMode('light');
      const state = ThemeController.state;
      expect(state.defaultThemeMode).toBe('light');
    });

    it('should set default theme mode to dark', () => {
      ThemeController.setDefaultThemeMode('dark');
      const state = ThemeController.state;
      expect(state.defaultThemeMode).toBe('dark');
    });

    it('should clear default theme mode when set to undefined', () => {
      ThemeController.setDefaultThemeMode('dark');
      ThemeController.setDefaultThemeMode(undefined);
      const state = ThemeController.state;
      expect(state.defaultThemeMode).toBeUndefined();
    });

    it('should update default theme mode from light to dark', () => {
      ThemeController.setDefaultThemeMode('light');
      ThemeController.setDefaultThemeMode('dark');
      const state = ThemeController.state;
      expect(state.defaultThemeMode).toBe('dark');
    });
  });

  describe('setSystemThemeMode', () => {
    it('should set system theme mode to dark', () => {
      ThemeController.setSystemThemeMode('dark');
      const state = ThemeController.state;
      expect(state.systemThemeMode).toBe('dark');
    });

    it('should set system theme mode to light', () => {
      ThemeController.setSystemThemeMode('light');
      const state = ThemeController.state;
      expect(state.systemThemeMode).toBe('light');
    });

    it('should default to light when called without arguments', () => {
      ThemeController.setSystemThemeMode();
      const state = ThemeController.state;
      expect(state.systemThemeMode).toBe('light');
    });

    it('should update system theme mode from light to dark', () => {
      ThemeController.setSystemThemeMode('light');
      ThemeController.setSystemThemeMode('dark');
      const state = ThemeController.state;
      expect(state.systemThemeMode).toBe('dark');
    });
  });

  describe('theme mode precedence', () => {
    it('should have both system and default theme modes set independently', () => {
      ThemeController.setSystemThemeMode('light');
      ThemeController.setDefaultThemeMode('dark');
      const state = ThemeController.state;
      expect(state.systemThemeMode).toBe('light');
      expect(state.defaultThemeMode).toBe('dark');
    });

    it('should allow default theme mode to be cleared while system remains', () => {
      ThemeController.setSystemThemeMode('dark');
      ThemeController.setDefaultThemeMode('light');
      ThemeController.setDefaultThemeMode(undefined);
      const state = ThemeController.state;
      expect(state.systemThemeMode).toBe('dark');
      expect(state.defaultThemeMode).toBeUndefined();
    });
    it('should derive themeMode with correct priority: defaultThemeMode > systemThemeMode > light', () => {
      // Initially, with no values set, should default to 'light'
      ThemeController.setDefaultThemeMode(undefined);
      ThemeController.setSystemThemeMode();
      expect(ThemeController.state.themeMode).toBe('light');

      // When only systemThemeMode is set, themeMode should follow it
      ThemeController.setSystemThemeMode('dark');
      expect(ThemeController.state.themeMode).toBe('dark');

      // When defaultThemeMode is set, it takes priority over systemThemeMode
      ThemeController.setDefaultThemeMode('light');
      expect(ThemeController.state.themeMode).toBe('light');

      // When defaultThemeMode is cleared, falls back to systemThemeMode
      ThemeController.setDefaultThemeMode(undefined);
      expect(ThemeController.state.themeMode).toBe('dark');
    });
  });

  describe('setThemeVariables', () => {
    it('should set theme variables', () => {
      const variables = { accent: '#000000' };
      ThemeController.setThemeVariables(variables);
      const state = ThemeController.state;
      expect(state.themeVariables).toEqual(variables);
    });

    it('should override existing theme variables', () => {
      const initialVariables = { accent: '#000000' };
      const newVariables = { accent: '#FFFFFF' };

      ThemeController.setThemeVariables(initialVariables);
      ThemeController.setThemeVariables(newVariables);
      const state = ThemeController.state;

      expect(state.themeVariables).toEqual({
        accent: '#FFFFFF'
      });
    });

    it('should reset theme variables when undefined', () => {
      const variables = { accent: '#000000' };
      ThemeController.setThemeVariables(variables);
      let state = ThemeController.state;
      expect(state.themeVariables).toEqual(variables);

      ThemeController.setThemeVariables(undefined);
      state = ThemeController.state;
      expect(state.themeVariables).toEqual({});
    });

    it('should handle empty object', () => {
      ThemeController.setThemeVariables({});
      const state = ThemeController.state;
      expect(state.themeVariables).toEqual({});
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
      ThemeController.setDefaultThemeMode('dark');
      expect(ThemeController.state).toBe(stateRef);
      const state = ThemeController.state;
      expect(state.defaultThemeMode).toBe('dark');
    });
  });
});
