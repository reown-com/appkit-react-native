import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import { BitcoinAdapter } from '../adapter';
import { UnitsUtil } from '../utils/UnitsUtil';

const bitcoin = {
  id: '000000000019d6689c085ae165831e93',
  name: 'Bitcoin',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  rpcUrls: { default: { http: ['https://rpc.example.com'] } },
  chainNamespace: 'bip122',
  caipNetworkId: 'bip122:000000000019d6689c085ae165831e93'
} as AppKitNetwork;

describe('BitcoinAdapter', () => {
  it('is a bip122 adapter', () => {
    const adapter = new BitcoinAdapter();

    expect(adapter.getSupportedNamespace()).toBe('bip122');
    expect(adapter.adapterType).toBe('bip122');
  });

  it('requires a connector before reading balances or switching networks', async () => {
    const adapter = new BitcoinAdapter();

    await expect(adapter.getBalance({ network: bitcoin })).rejects.toThrow('No active connector');
    await expect(adapter.switchNetwork(bitcoin)).rejects.toThrow('No active connector');
  });
});

describe('UnitsUtil.parseSatoshis', () => {
  it('converts satoshis to BTC', () => {
    expect(UnitsUtil.parseSatoshis('150000000', bitcoin)).toBe('1.5');
    expect(UnitsUtil.parseSatoshis('1', bitcoin)).toBe('0.00000001');
  });
});
