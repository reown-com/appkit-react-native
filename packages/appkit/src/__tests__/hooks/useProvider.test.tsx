import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { ConnectionsController, LogController } from '@reown/appkit-core-react-native';
import { useProvider } from '../../hooks/useProvider';
import { type AppKitContextType, AppKitContext } from '../../AppKitContext';
import type { AppKit } from '../../AppKit';

// Mock valtio
jest.mock('valtio', () => ({
  useSnapshot: jest.fn(state => state)
}));

// Mock ConnectionsController
jest.mock(
  '@reown/appkit-core-react-native',
  () => ({
    ConnectionsController: {
      state: { connection: undefined }
    },
    LogController: {
      sendError: jest.fn()
    }
  }),
  { virtual: true }
);

const setConnection = (connection: unknown) => {
  (ConnectionsController as { state: unknown }).state = { connection };
};

describe('useProvider', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setConnection(undefined);
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useProvider());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should return undefined provider when there is no connection', () => {
    const { result } = renderHook(() => useProvider(), { wrapper });

    expect(result.current).toEqual({ provider: undefined, providerType: undefined });
  });

  it('should return undefined provider when the connection has no adapter', () => {
    setConnection({ accounts: [], caipNetwork: 'eip155:1' });

    const { result } = renderHook(() => useProvider(), { wrapper });

    expect(result.current).toEqual({ provider: undefined, providerType: undefined });
  });

  it('should return the provider and namespace of the active connection adapter', () => {
    const provider = { request: jest.fn() };
    setConnection({
      accounts: [],
      caipNetwork: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      adapter: {
        getProvider: jest.fn().mockReturnValue(provider),
        getSupportedNamespace: jest.fn().mockReturnValue('solana')
      }
    });

    const { result } = renderHook(() => useProvider(), { wrapper });

    expect(result.current.provider).toBe(provider);
    expect(result.current.providerType).toBe('solana');
  });

  it('should not throw while the provider is still being restored', () => {
    const error = new Error('Provider not initialized');
    setConnection({
      accounts: [],
      caipNetwork: 'eip155:1',
      adapter: {
        getProvider: jest.fn(() => {
          throw error;
        }),
        getSupportedNamespace: jest.fn().mockReturnValue('eip155')
      }
    });

    const { result } = renderHook(() => useProvider(), { wrapper });

    expect(result.current).toEqual({ provider: undefined, providerType: undefined });
    expect(LogController.sendError).toHaveBeenCalledWith(error, 'useProvider', 'useProvider');
  });
});
