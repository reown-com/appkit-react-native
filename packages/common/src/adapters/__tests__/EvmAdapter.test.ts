import { EVMAdapter } from '../EvmAdapter';
import type { AppKitNetwork, CaipAddress } from '../../utils/TypeUtil';

const network: AppKitNetwork = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://eth.merkle.io']
    }
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://etherscan.io'
    }
  },
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1'
};

// Mock implementation for testing
class MockEVMAdapter extends EVMAdapter {
  private mockProvider: any;

  constructor() {
    super({ supportedNamespace: 'eip155', adapterType: 'ethers' });
    this.mockProvider = {
      request: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
  }

  setMockProvider(provider: any) {
    this.mockProvider = provider;
  }

  override getProvider() {
    return this.mockProvider;
  }

  async disconnect(): Promise<void> {}
  getSupportedNamespace() {
    return 'eip155' as const;
  }
  async getBalance() {
    return { amount: '0', symbol: 'ETH' };
  }
  getAccounts(): CaipAddress[] | undefined {
    return ['eip155:1:0x1234567890123456789012345678901234567890'];
  }
  async switchNetwork() {}
}

describe('EVMAdapter', () => {
  let adapter: MockEVMAdapter;

  beforeEach(() => {
    adapter = new MockEVMAdapter();
  });

  describe('writeContract', () => {
    it('should encode transfer function correctly', async () => {
      const mockProvider = {
        request: jest.fn().mockResolvedValueOnce('0x1234567890abcdef') // eth_sendTransaction
      };
      adapter.setMockProvider(mockProvider);

      const result = await adapter.writeContract({
        tokenAddress: '0x1234567890123456789012345678901234567890',
        receiverAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        tokenAmount: BigInt(1000000000000000000), // 1 token with 18 decimals
        fromAddress: '0x1234567890123456789012345678901234567890',
        method: 'transfer',
        network
      });

      expect(result).toBe('0x1234567890abcdef');
      expect(mockProvider.request).toHaveBeenCalledWith(
        {
          method: 'eth_sendTransaction',
          params: [
            {
              from: '0x1234567890123456789012345678901234567890',
              to: '0x1234567890123456789012345678901234567890',
              data: '0xa9059cbb000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcd0000000000000000000000000000000000000000000000000de0b6b3a7640000',
              value: '0x0',
              type: '0x0'
            }
          ]
        },
        'eip155:1'
      );
    });

    it('should throw error for unsupported method', async () => {
      await expect(
        adapter.writeContract({
          tokenAddress: '0x1234567890123456789012345678901234567890',
          receiverAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          tokenAmount: BigInt(1000000000000000000),
          fromAddress: '0x1234567890123456789012345678901234567890',
          method: 'unsupported' as any,
          network
        })
      ).rejects.toThrow("method 'unsupported' is not supported");
    });

    it('should throw error when provider is undefined', async () => {
      adapter.setMockProvider(undefined);

      await expect(
        adapter.writeContract({
          tokenAddress: '0x1234567890123456789012345678901234567890',
          receiverAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          tokenAmount: BigInt(1000000000000000000),
          fromAddress: '0x1234567890123456789012345678901234567890',
          method: 'transfer',
          network
        })
      ).rejects.toThrow('provider is undefined');
    });
  });
});
