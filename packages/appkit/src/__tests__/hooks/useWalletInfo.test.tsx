import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { ConnectionsController } from '@reown/appkit-core-react-native';
import { useWalletInfo } from '../../hooks/useWalletInfo';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

// Mock valtio
jest.mock('valtio', () => ({
  useSnapshot: jest.fn(state => state)
}));

// Mock ConnectionsController
jest.mock('@reown/appkit-core-react-native', () => ({
  ConnectionsController: {
    state: { walletInfo: undefined }
  }
}));

describe('useWalletInfo', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ConnectionsController as { state: unknown }).state = { walletInfo: undefined };
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useWalletInfo());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should return undefined walletInfo when not connected', () => {
    const { result } = renderHook(() => useWalletInfo(), { wrapper });

    expect(result.current).toEqual({ walletInfo: undefined });
  });

  it('should return the wallet info of the active connection', () => {
    const walletInfo = { name: 'MetaMask', icon: 'https://example.com/icon.png' };
    (ConnectionsController as { state: unknown }).state = { walletInfo };

    const { result } = renderHook(() => useWalletInfo(), { wrapper });

    expect(result.current.walletInfo).toBe(walletInfo);
  });

  it('should keep the same reference while walletInfo does not change', () => {
    const walletInfo = { name: 'MetaMask' };
    (ConnectionsController as { state: unknown }).state = { walletInfo };

    const { result, rerender } = renderHook(() => useWalletInfo(), { wrapper });
    const first = result.current;

    rerender({});

    expect(result.current).toBe(first);
  });
});
