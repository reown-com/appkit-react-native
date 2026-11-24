import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useAppKit } from '../../hooks/useAppKit';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

describe('useAppKit', () => {
  const mockAppKit = {
    open: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    switchNetwork: jest.fn().mockResolvedValue(undefined)
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit as unknown as AppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAppKit());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should delegate open to the AppKit instance', () => {
    const { result } = renderHook(() => useAppKit(), { wrapper });

    act(() => {
      result.current.open({ view: 'Networks' });
    });

    expect(mockAppKit.open).toHaveBeenCalledWith({ view: 'Networks' });
    expect(mockAppKit.open.mock.contexts[0]).toBe(mockAppKit);
  });

  it('should delegate close to the AppKit instance', () => {
    const { result } = renderHook(() => useAppKit(), { wrapper });

    act(() => {
      result.current.close();
    });

    expect(mockAppKit.close).toHaveBeenCalledTimes(1);
    expect(mockAppKit.close.mock.contexts[0]).toBe(mockAppKit);
  });

  it('should delegate disconnect to the AppKit instance', () => {
    const { result } = renderHook(() => useAppKit(), { wrapper });

    act(() => {
      result.current.disconnect();
      result.current.disconnect('solana');
    });

    expect(mockAppKit.disconnect).toHaveBeenNthCalledWith(1, undefined);
    expect(mockAppKit.disconnect).toHaveBeenNthCalledWith(2, 'solana');
    expect(mockAppKit.disconnect.mock.contexts[0]).toBe(mockAppKit);
  });

  it('should delegate switchNetwork to the AppKit instance', () => {
    const { result } = renderHook(() => useAppKit(), { wrapper });

    act(() => {
      result.current.switchNetwork('eip155:137');
    });

    expect(mockAppKit.switchNetwork).toHaveBeenCalledWith('eip155:137');
    expect(mockAppKit.switchNetwork.mock.contexts[0]).toBe(mockAppKit);
  });

  it('should return stable function references across renders', () => {
    const { result, rerender } = renderHook(() => useAppKit(), { wrapper });
    const first = result.current;

    rerender({});

    expect(result.current).toBe(first);
  });
});
