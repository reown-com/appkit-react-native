import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { ConnectionsController, ModalController } from '@reown/appkit-core-react-native';
import { useAppKitState } from '../../hooks/useAppKitState';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

// Mock valtio
jest.mock('valtio', () => ({
  useSnapshot: jest.fn(state => state)
}));

// Mock ConnectionsController and ModalController
jest.mock('@reown/appkit-core-react-native', () => ({
  ConnectionsController: {
    state: {}
  },
  ModalController: {
    state: { open: false, loading: false }
  }
}));

const mainnet = { id: 1, caipNetworkId: 'eip155:1', name: 'Ethereum', chainNamespace: 'eip155' };

describe('useAppKitState', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ConnectionsController as { state: unknown }).state = {
      activeAddress: undefined,
      connection: undefined,
      networks: [mainnet]
    };
    (ModalController as { state: unknown }).state = { open: false, loading: false };
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAppKitState());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should return the initial state', () => {
    const { result } = renderHook(() => useAppKitState(), { wrapper });

    expect(result.current).toEqual({
      isOpen: false,
      isLoading: false,
      isConnected: false,
      chain: undefined
    });
  });

  it('should reflect the modal open and loading state', () => {
    (ModalController as { state: unknown }).state = { open: true, loading: true };

    const { result } = renderHook(() => useAppKitState(), { wrapper });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.isLoading).toBe(true);
  });

  it('should return the connection status and active chain', () => {
    (ConnectionsController as { state: unknown }).state = {
      activeAddress: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678',
      connection: { caipNetwork: 'eip155:1' },
      networks: [mainnet]
    };

    const { result } = renderHook(() => useAppKitState(), { wrapper });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.chain).toBe(mainnet);
  });
});
