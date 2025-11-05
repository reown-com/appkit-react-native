import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useAppKitTheme } from '../../hooks/useAppKitTheme';
import { ThemeController } from '@reown/appkit-core-react-native';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

// Mock valtio
jest.mock('valtio', () => ({
  useSnapshot: jest.fn(state => state)
}));

// Mock ThemeController
jest.mock('@reown/appkit-core-react-native', () => ({
  ThemeController: {
    state: {
      themeMode: undefined,
      themeVariables: undefined
    },
    setThemeMode: jest.fn(),
    setThemeVariables: jest.fn()
  }
}));

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
      themeMode: undefined,
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

  it('should return initial theme state', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    expect(result.current.themeMode).toBeUndefined();
    expect(result.current.themeVariables).toEqual({});
  });

  it('should return dark theme mode when set', () => {
    ThemeController.state = {
      themeMode: 'dark',
      themeVariables: {}
    };

    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    expect(result.current.themeMode).toBe('dark');
  });

  it('should return light theme mode when set', () => {
    ThemeController.state = {
      themeMode: 'light',
      themeVariables: {}
    };

    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    expect(result.current.themeMode).toBe('light');
  });

  it('should return theme variables when set', () => {
    const themeVariables = { accent: '#00BB7F' };
    ThemeController.state = {
      themeMode: undefined,
      themeVariables
    };

    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    expect(result.current.themeVariables).toEqual(themeVariables);
  });

  it('should call ThemeController.setThemeMode when setThemeMode is called', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode('dark');
    });

    expect(ThemeController.setThemeMode).toHaveBeenCalledWith('dark');
  });

  it('should call ThemeController.setThemeMode with undefined', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode(undefined);
    });

    expect(ThemeController.setThemeMode).toHaveBeenCalledWith(undefined);
  });

  it('should call ThemeController.setThemeVariables when setThemeVariables is called', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });
    const themeVariables = { accent: '#FF5733' };

    act(() => {
      result.current.setThemeVariables(themeVariables);
    });

    expect(ThemeController.setThemeVariables).toHaveBeenCalledWith(themeVariables);
  });

  it('should call ThemeController.setThemeVariables with undefined', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    act(() => {
      result.current.setThemeVariables(undefined);
    });

    expect(ThemeController.setThemeVariables).toHaveBeenCalledWith(undefined);
  });

  it('should return stable function references', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    const firstSetThemeMode = result.current.setThemeMode;
    const firstSetThemeVariables = result.current.setThemeVariables;

    // Functions should be stable (same reference)
    expect(result.current.setThemeMode).toBe(firstSetThemeMode);
    expect(result.current.setThemeVariables).toBe(firstSetThemeVariables);
  });

  it('should update theme mode and variables together', () => {
    ThemeController.state = {
      themeMode: 'dark',
      themeVariables: { accent: '#00BB7F' }
    };

    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.themeVariables).toEqual({ accent: '#00BB7F' });
  });

  it('should handle multiple setThemeMode calls', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });

    act(() => {
      result.current.setThemeMode('dark');
      result.current.setThemeMode('light');
      result.current.setThemeMode(undefined);
    });

    expect(ThemeController.setThemeMode).toHaveBeenCalledTimes(3);
    expect(ThemeController.setThemeMode).toHaveBeenNthCalledWith(1, 'dark');
    expect(ThemeController.setThemeMode).toHaveBeenNthCalledWith(2, 'light');
    expect(ThemeController.setThemeMode).toHaveBeenNthCalledWith(3, undefined);
  });

  it('should handle multiple setThemeVariables calls', () => {
    const { result } = renderHook(() => useAppKitTheme(), { wrapper });
    const variables1 = { accent: '#00BB7F' };
    const variables2 = { accent: '#FF5733' };

    act(() => {
      result.current.setThemeVariables(variables1);
      result.current.setThemeVariables(variables2);
    });

    expect(ThemeController.setThemeVariables).toHaveBeenCalledTimes(2);
    expect(ThemeController.setThemeVariables).toHaveBeenNthCalledWith(1, variables1);
    expect(ThemeController.setThemeVariables).toHaveBeenNthCalledWith(2, variables2);
  });
});
