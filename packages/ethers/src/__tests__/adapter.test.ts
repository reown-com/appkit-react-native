import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import { EthersAdapter } from '../adapter';
import { formatEther } from '../helpers';

const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.example.com'] } },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1'
} as AppKitNetwork;

describe('EthersAdapter', () => {
  it('is an eip155 adapter of type ethers', () => {
    const adapter = new EthersAdapter();

    expect(adapter.getSupportedNamespace()).toBe('eip155');
    expect(adapter.adapterType).toBe('ethers');
  });

  it('requires a connector before reading balances or switching networks', async () => {
    const adapter = new EthersAdapter();

    await expect(adapter.getBalance({ network: mainnet })).rejects.toThrow('No active connector');
    await expect(adapter.switchNetwork(mainnet)).rejects.toThrow('No active connector');
  });
});

describe('formatEther', () => {
  it('converts wei to ether', () => {
    expect(formatEther(1500000000000000000n)).toBe('1.5');
    expect(formatEther(0n)).toBe('0');
  });
});
