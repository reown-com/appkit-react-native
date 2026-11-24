import { bitcoin, bitcoinTestnet } from '@reown/appkit-common-react-native';

import { describeAdapterContract } from '../../../common/src/__fixtures__/adapterContract';
import { FakeConnector } from '../../../common/src/__fixtures__/adapterFakes';
import { BitcoinAdapter } from '../adapter';

const ADDRESS = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

describeAdapterContract({
  name: 'BitcoinAdapter',
  createAdapter: () => new BitcoinAdapter(),
  namespace: 'bip122',
  chains: [String(bitcoin.id), String(bitcoinTestnet.id)],
  address: ADDRESS,
  network: bitcoin
});

describe('BitcoinAdapter', () => {
  const setup = () => {
    const adapter = new BitcoinAdapter();
    const connector = new FakeConnector({
      namespaces: {
        bip122: {
          accounts: [`${bitcoin.caipNetworkId}:${ADDRESS}`],
          chains: [bitcoin.caipNetworkId],
          methods: [],
          events: []
        }
      }
    });
    adapter.init({ connector });

    return { adapter, connector, provider: connector.fakeProvider };
  };

  it('switches network through the connector', async () => {
    const { adapter, connector } = setup();

    await adapter.switchNetwork(bitcoinTestnet);

    expect(connector.switchNetwork).toHaveBeenCalledWith(bitcoinTestnet);
  });

  it('signs a message on the requested chain', async () => {
    const { adapter, provider } = setup();
    // A 65-byte signature, base64 encoded
    const signature = Buffer.alloc(65, 1).toString('base64');
    provider.request.mockResolvedValueOnce({ address: ADDRESS, signature });

    const result = await adapter.signMessage(ADDRESS, 'hello', String(bitcoin.id));

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'signMessage',
        params: { message: 'hello', account: ADDRESS, address: ADDRESS, protocol: 'ecdsa' }
      },
      bitcoin.caipNetworkId
    );
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
