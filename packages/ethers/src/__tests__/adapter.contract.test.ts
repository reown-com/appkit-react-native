import type { AppKitNetwork } from '@reown/appkit-common-react-native';

import { describeAdapterContract } from '../../../common/src/__fixtures__/adapterContract';
import { FakeConnector } from '../../../common/src/__fixtures__/adapterFakes';
import { EthersAdapter } from '../adapter';

const ADDRESS = '0x1234567890123456789012345678901234567890';

const polygon = {
  id: 137,
  name: 'Polygon',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:137',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.test'] } }
} as unknown as AppKitNetwork;

describeAdapterContract({
  name: 'EthersAdapter',
  createAdapter: () => new EthersAdapter(),
  namespace: 'eip155',
  chains: ['1', '137'],
  address: ADDRESS,
  network: polygon
});

describe('EthersAdapter switchNetwork', () => {
  const setup = () => {
    const adapter = new EthersAdapter();
    const connector = new FakeConnector({
      namespaces: {
        eip155: {
          accounts: [`eip155:1:${ADDRESS}`],
          chains: ['eip155:1'],
          methods: [],
          events: []
        }
      }
    });
    adapter.init({ connector });

    return { adapter, provider: connector.fakeProvider };
  };

  it('asks the wallet to switch with the hex chain id', async () => {
    const { adapter, provider } = setup();

    await adapter.switchNetwork(polygon);

    expect(provider.request).toHaveBeenCalledWith(
      { method: 'wallet_switchEthereumChain', params: [{ chainId: '0x89' }] },
      'eip155:137'
    );
  });

  it('rejects when the user rejects the switch', async () => {
    const { adapter, provider } = setup();
    provider.request.mockRejectedValueOnce(new Error('User rejected the request'));

    await expect(adapter.switchNetwork(polygon)).rejects.toThrow('Chain is not supported');
  });

  it('passes other wallet errors through', async () => {
    const { adapter, provider } = setup();
    provider.request.mockRejectedValueOnce(new Error('Unrecognized chain ID'));

    await expect(adapter.switchNetwork(polygon)).rejects.toThrow('Unrecognized chain ID');
  });
});
