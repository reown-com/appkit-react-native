import { ThemeController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('ThemeController', () => {
  it('should have valid default state', () => {
    expect(ThemeController.state).toEqual({
      themeMode: 'dark',
      themeVariables: {}
    });
  });

  it('should update state correctly when changing theme', () => {
    ThemeController.setThemeMode('light');
    expect(ThemeController.state).toEqual({
      themeMode: 'light',
      themeVariables: {}
    });
  });
});
