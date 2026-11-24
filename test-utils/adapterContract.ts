/**
 * Behaviour every BlockchainAdapter must keep, whatever chain it serves.
 * Call it from each adapter package's tests: `describeAdapterContract({ ... })`.
 */
import type {
  AppKitNetwork,
  BlockchainAdapter,
  CaipAddress,
  ChainNamespace
} from '@reown/appkit-common-react-native';

import { FakeConnector } from './adapterFakes';

export interface AdapterContractOptions {
  name: string;
  createAdapter: () => BlockchainAdapter;
  namespace: ChainNamespace;
  // Two chain references the wallet approved, e.g. ['1', '137'] for EVM
  chains: [string, string];
  // An address the wallet approved on both chains, without the CAIP prefix
  address: string;
  network: AppKitNetwork;
}

export function describeAdapterContract({
  name,
  createAdapter,
  namespace,
  chains,
  address,
  network
}: AdapterContractOptions) {
  describe(`${name} adapter contract`, () => {
    const accounts = chains.map(chain => `${namespace}:${chain}:${address}` as CaipAddress);

    const setup = () => {
      const adapter = createAdapter();
      const connector = new FakeConnector({
        namespaces: {
          [namespace]: {
            accounts,
            chains: chains.map(chain => `${namespace}:${chain}`) as any,
            methods: [],
            events: []
          }
        }
      });
      adapter.init({ connector });

      return { adapter, connector, provider: connector.fakeProvider };
    };

    const providerEvents = ['chainChanged', 'accountsChanged', 'disconnect'];

    it('serves its namespace', () => {
      expect(createAdapter().getSupportedNamespace()).toBe(namespace);
    });

    it('returns the approved accounts', () => {
      const { adapter } = setup();

      expect(adapter.getAccounts()).toEqual(accounts);
    });

    it('listens to the provider once, also when init runs again', () => {
      const { adapter, connector, provider } = setup();
      adapter.init({ connector });
      adapter.init({ connector });

      providerEvents.forEach(event => expect(provider.listenerCount(event)).toBe(1));
    });

    it('forwards chain changes to approved chains only', () => {
      const { adapter, provider } = setup();
      const listener = jest.fn();
      adapter.on('chainChanged', listener);

      provider.emit('chainChanged', chains[1]);
      provider.emit('chainChanged', 'unapproved-chain');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({ chainId: chains[1] });
    });

    it('forwards account changes as approved CAIP accounts', () => {
      const { adapter, provider } = setup();
      const listener = jest.fn();
      adapter.on('accountsChanged', listener);

      provider.emit('accountsChanged', [address]);

      expect(listener).toHaveBeenCalledWith({ accounts });
    });

    it('forwards the wallet disconnect once and stops listening', () => {
      const { adapter, provider } = setup();
      const listener = jest.fn();
      adapter.on('disconnect', listener);

      provider.emit('disconnect');
      provider.emit('disconnect');

      expect(listener).toHaveBeenCalledTimes(1);
      expect(adapter.connector).toBeUndefined();
      providerEvents.forEach(event => expect(provider.listenerCount(event)).toBe(0));
    });

    it('stops listening to the provider when the connector is removed', () => {
      const { adapter, provider } = setup();

      adapter.removeConnector();

      expect(adapter.connector).toBeUndefined();
      providerEvents.forEach(event => expect(provider.listenerCount(event)).toBe(0));
    });

    it('closes the session through the connector', async () => {
      const { adapter, connector } = setup();

      await adapter.disconnect();

      expect(connector.disconnect).toHaveBeenCalledTimes(1);
    });

    it('rejects switching network and reading balances without a connector', async () => {
      const adapter = createAdapter();

      await expect(adapter.switchNetwork(network)).rejects.toThrow(/connector/i);
      await expect(adapter.getBalance({ network })).rejects.toThrow(/connector/i);
    });
  });
}
