import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { ConnectionsController, LogController } from '@reown/appkit-core-react-native';
import { useAccount } from '../../hooks/useAccount';
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
      state: {}
    },
    CoreHelperUtil: {
      getPlainAddress: jest.fn((address?: string) => address?.split(':')[2])
    },
    LogController: {
      sendError: jest.fn()
    }
  }),
  { virtual: true }
);

const mainnet = { id: 1, caipNetworkId: 'eip155:1', name: 'Ethereum', chainNamespace: 'eip155' };
const polygon = { id: 137, caipNetworkId: 'eip155:137', name: 'Polygon', chainNamespace: 'eip155' };
const solanaNetwork = {
  id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  name: 'Solana',
  chainNamespace: 'solana'
};

const EVM_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const SOLANA_ADDRESS = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

const setConnectionsState = (state: Record<string, unknown>) => {
  (ConnectionsController as { state: unknown }).state = {
    activeAddress: undefined,
    activeNamespace: undefined,
    connection: undefined,
    connections: new Map(),
    networks: [mainnet, polygon, solanaNetwork],
    ...state
  };
};

describe('useAccount', () => {
  const mockAppKit = {} as AppKit;

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const contextValue: AppKitContextType = { appKit: mockAppKit };

    return <AppKitContext.Provider value={contextValue}>{children}</AppKitContext.Provider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setConnectionsState({});
  });

  it('should throw error when used outside AppKitProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAccount());
    }).toThrow('AppKit instance is not yet available in context.');

    consoleSpy.mockRestore();
  });

  it('should return a disconnected state when there is no active address', () => {
    const { result } = renderHook(() => useAccount(), { wrapper });

    expect(result.current).toEqual({
      allAccounts: [],
      address: undefined,
      isConnected: false,
      chainId: undefined,
      chain: undefined,
      namespace: undefined
    });
  });

  it('should derive address, chainId, chain and namespace from the active connection', () => {
    const connection = {
      accounts: [`eip155:137:${EVM_ADDRESS}`],
      caipNetwork: 'eip155:137',
      type: 'eoa'
    };

    setConnectionsState({
      activeAddress: `eip155:137:${EVM_ADDRESS}`,
      activeNamespace: 'eip155',
      connection,
      connections: new Map([['eip155', connection]])
    });

    const { result } = renderHook(() => useAccount(), { wrapper });

    expect(result.current.address).toBe(EVM_ADDRESS);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.chainId).toBe('137');
    expect(result.current.chain).toBe(polygon);
    expect(result.current.namespace).toBe('eip155');
  });

  it('should list the accounts of every connection in allAccounts', () => {
    const evmConnection = {
      accounts: [`eip155:1:${EVM_ADDRESS}`, `eip155:137:${EVM_ADDRESS}`],
      caipNetwork: 'eip155:1',
      type: 'smartAccount'
    };
    const solanaConnection = {
      accounts: [`${solanaNetwork.caipNetworkId}:${SOLANA_ADDRESS}`],
      caipNetwork: solanaNetwork.caipNetworkId,
      type: 'eoa'
    };

    setConnectionsState({
      activeAddress: `eip155:1:${EVM_ADDRESS}`,
      activeNamespace: 'eip155',
      connection: evmConnection,
      connections: new Map([
        ['eip155', evmConnection],
        ['solana', solanaConnection]
      ])
    });

    const { result } = renderHook(() => useAccount(), { wrapper });

    expect(result.current.allAccounts).toEqual([
      { address: EVM_ADDRESS, namespace: 'eip155', chainId: '1', type: 'smartAccount' },
      { address: EVM_ADDRESS, namespace: 'eip155', chainId: '137', type: 'smartAccount' },
      {
        address: SOLANA_ADDRESS,
        namespace: 'solana',
        chainId: solanaNetwork.id,
        type: 'eoa'
      }
    ]);
  });

  it('should skip malformed accounts and log an error', () => {
    const connection = {
      accounts: ['eip155:1', `eip155:1:${EVM_ADDRESS}`],
      caipNetwork: 'eip155:1',
      type: 'eoa'
    };

    setConnectionsState({
      activeAddress: `eip155:1:${EVM_ADDRESS}`,
      activeNamespace: 'eip155',
      connection,
      connections: new Map([['eip155', connection]])
    });

    const { result } = renderHook(() => useAccount(), { wrapper });

    expect(result.current.allAccounts).toEqual([
      { address: EVM_ADDRESS, namespace: 'eip155', chainId: '1', type: 'eoa' }
    ]);
    expect(LogController.sendError).toHaveBeenCalledWith(
      'Invalid account',
      'useAccount.ts',
      'useAccount',
      { account: 'eip155:1' }
    );
  });

  it('should return an undefined chain when the active network is not configured', () => {
    const connection = {
      accounts: [`eip155:10:${EVM_ADDRESS}`],
      caipNetwork: 'eip155:10',
      type: 'eoa'
    };

    setConnectionsState({
      activeAddress: `eip155:10:${EVM_ADDRESS}`,
      activeNamespace: 'eip155',
      connection,
      connections: new Map([['eip155', connection]])
    });

    const { result } = renderHook(() => useAccount(), { wrapper });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.chainId).toBeUndefined();
    expect(result.current.chain).toBeUndefined();
  });
});
