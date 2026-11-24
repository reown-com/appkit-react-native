import { ThemeController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('ThemeController', () => {
  beforeEach(() => {
    ThemeController.setDefaultThemeMode(undefined);
    ThemeController.setSystemThemeMode();
    ThemeController.setThemeVariables(undefined);
  });

  it('derives themeMode from defaultThemeMode, then systemThemeMode, then light', () => {
    expect(ThemeController.state.themeMode).toBe('light');

    ThemeController.setSystemThemeMode('dark');
    expect(ThemeController.state.themeMode).toBe('dark');

    ThemeController.setDefaultThemeMode('light');
    expect(ThemeController.state.themeMode).toBe('light');

    ThemeController.setDefaultThemeMode(undefined);
    expect(ThemeController.state.themeMode).toBe('dark');
  });

  it('merges new theme variables into the existing ones', () => {
    ThemeController.setThemeVariables({ accent: '#000000' });
    ThemeController.setThemeVariables({});

    expect(ThemeController.state.themeVariables).toEqual({ accent: '#000000' });

    ThemeController.setThemeVariables({ accent: '#FFFFFF' });

    expect(ThemeController.state.themeVariables).toEqual({ accent: '#FFFFFF' });
  });

  it('clears theme variables when set to undefined', () => {
    ThemeController.setThemeVariables({ accent: '#000000' });
    ThemeController.setThemeVariables(undefined);

    expect(ThemeController.state.themeVariables).toEqual({});
  });
});
