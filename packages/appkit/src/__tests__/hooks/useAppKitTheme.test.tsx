import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useAppKitTheme } from '../../hooks/useAppKitTheme';
import { ThemeController } from '@reown/appkit-core-react-native';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

// Mock Appearance
jest.mock('react-native', () => ({
  Appearance: {
    getColorScheme: jest.fn().mockReturnValue('light')
  }
}));

// Mock valtio
jest.mock('valtio', () => ({
  useSnapshot: jest.fn(state => state)
}));

// Mock ThemeController
jest.mock(
  '@reown/appkit-core-react-native',
  () => ({
    ThemeController: {
      state: {
        themeMode: 'light',
        themeVariables: {}
      },
      setDefaultThemeMode: jest.fn(),
      setThemeVariables: jest.fn()
    }
  }),
  { virtual: true }
);

describe('useAppKitTheme', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset ThemeController state
    ThemeController.state = {
      themeMode: 'light',
      themeVariables: {}
    };
  });

  it('should throw error when used outside AppKitProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAppKitTheme());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should return the theme mode and variables from ThemeController', () => {
    const themeVariables = { accent: '#00BB7F' };
    ThemeController.state = {
      themeMode: 'dark',
      themeVariables
    };

    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.themeVariables).toEqual(themeVariables);
  });

  it('should call ThemeController.setDefaultThemeMode when setThemeMode is called', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode('dark');
    });

    expect(ThemeController.setDefaultThemeMode).toHaveBeenCalledWith('dark');
  });

  it('should call ThemeController.setThemeVariables when setThemeVariables is called', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });
    const themeVariables = { accent: '#FF5733' };

    act(() => {
      result.current.setThemeVariables(themeVariables);
    });

    expect(ThemeController.setThemeVariables).toHaveBeenCalledWith(themeVariables);
  });
});
