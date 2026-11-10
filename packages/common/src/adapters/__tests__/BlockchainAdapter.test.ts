import { EventEmitter } from 'events';
import { BlockchainAdapter } from '../BlockchainAdapter';
import type { CaipAddress, WalletConnector } from '../../types';

const ACCOUNT: CaipAddress = 'eip155:1:0x1234567890123456789012345678901234567890';
const PROVIDER_EVENTS = ['chainChanged', 'accountsChanged', 'disconnect'];

class TestAdapter extends BlockchainAdapter {
  constructor() {
    super({ supportedNamespace: 'eip155', adapterType: 'ethers' });
  }

  async disconnect(): Promise<void> {}
  getSupportedNamespace() {
    return 'eip155' as const;
  }
  async getBalance() {
    return { amount: '0', symbol: 'ETH' };
  }
  getAccounts(): CaipAddress[] | undefined {
    return this.connector ? [ACCOUNT] : undefined;
  }
  async switchNetwork() {}
}

// The WalletConnect connector is created once and reused, so the same provider
// instance is handed to the adapter on every connect.
const createConnector = (provider: EventEmitter) =>
  ({ getProvider: () => provider }) as unknown as WalletConnector;

const listenerCount = (provider: EventEmitter) =>
  PROVIDER_EVENTS.reduce((total, event) => total + provider.listenerCount(event), 0);

describe('BlockchainAdapter provider listeners', () => {
  let provider: EventEmitter;
  let connector: WalletConnector;
  let adapter: TestAdapter;

  beforeEach(() => {
    provider = new EventEmitter();
    connector = createConnector(provider);
    adapter = new TestAdapter();
  });

  it('subscribes one listener per event on init', () => {
    adapter.init({ connector });

    PROVIDER_EVENTS.forEach(event => expect(provider.listenerCount(event)).toBe(1));
  });

  it('removes its provider listeners when the provider disconnects', () => {
    adapter.init({ connector });

    provider.emit('disconnect');

    expect(listenerCount(provider)).toBe(0);
    expect(adapter.connector).toBeUndefined();
  });

  it('does not accumulate listeners across connect/disconnect cycles', () => {
    for (let i = 0; i < 5; i++) {
      adapter.init({ connector });
      provider.emit('disconnect');
    }

    adapter.init({ connector });

    PROVIDER_EVENTS.forEach(event => expect(provider.listenerCount(event)).toBe(1));
  });

  it('does not stack listeners when init is called again without a disconnect', () => {
    adapter.init({ connector });
    adapter.init({ connector });

    PROVIDER_EVENTS.forEach(event => expect(provider.listenerCount(event)).toBe(1));
  });

  it('moves its listeners when re-initialised with a different provider', () => {
    const otherProvider = new EventEmitter();

    adapter.init({ connector });
    adapter.init({ connector: createConnector(otherProvider) });

    expect(listenerCount(provider)).toBe(0);
    PROVIDER_EVENTS.forEach(event => expect(otherProvider.listenerCount(event)).toBe(1));
  });

  it('removes its listeners when the connector is removed', () => {
    adapter.init({ connector });
    adapter.removeConnector();

    expect(listenerCount(provider)).toBe(0);
  });

  it('emits chainChanged once per wallet event after several reconnects', () => {
    const onChainChanged = jest.fn();
    adapter.on('chainChanged', onChainChanged);

    for (let i = 0; i < 3; i++) {
      adapter.init({ connector });
      provider.emit('disconnect');
    }
    adapter.init({ connector });

    provider.emit('chainChanged', '1');

    expect(onChainChanged).toHaveBeenCalledTimes(1);
    expect(onChainChanged).toHaveBeenCalledWith({ chainId: '1' });
  });

  it('emits disconnect while the connector is still set', () => {
    let connectorDuringEmit: WalletConnector | undefined;
    adapter.on('disconnect', () => {
      connectorDuringEmit = adapter.connector;
    });

    adapter.init({ connector });
    provider.emit('disconnect');

    expect(connectorDuringEmit).toBe(connector);
  });
});
