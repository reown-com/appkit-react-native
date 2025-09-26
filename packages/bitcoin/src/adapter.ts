import {
  BitcoinBaseAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { BitcoinApi } from './utils/BitcoinApi';
import { UnitsUtil } from './utils/UnitsUtil';
import { FormatUtil } from './utils/FormatUtil';

export class BitcoinAdapter extends BitcoinBaseAdapter {
  private static supportedNamespace: ChainNamespace = 'bip122';
  private static api = BitcoinApi;

  constructor() {
    super({
      supportedNamespace: BitcoinAdapter.supportedNamespace,
      adapterType: 'bip122'
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address } = params;

    if (!this.connector) throw new Error('No active connector');
    if (!network) throw new Error('No network provided');

    const balanceCaipAddress =
      address || this.getAccounts()?.find(account => account.includes(network.id.toString()));

    const balanceAddress = balanceCaipAddress?.split(':')[2];

    if (!balanceCaipAddress || !balanceAddress) {
      return Promise.resolve({ amount: '0.00', symbol: 'BTC' });
    }

    try {
      const utxos = await BitcoinAdapter.api.getUTXOs({
        network,
        address: balanceAddress
      });

      const balance = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
      const formattedBalance = UnitsUtil.parseSatoshis(balance.toString(), network);

      this.emit('balanceChanged', {
        address: balanceCaipAddress,
        balance: {
          amount: formattedBalance,
          symbol: network.nativeCurrency.symbol
        }
      });

      return { amount: formattedBalance, symbol: network.nativeCurrency.symbol };
    } catch (error) {
      return { amount: '0.00', symbol: 'BTC' };
    }
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider('bip122');
    if (!provider) throw new Error('No active provider');

    try {
      await this.connector.switchNetwork(network);

      return;
    } catch (switchError: any) {
      throw switchError;
    }
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
  }

  disconnect(): Promise<void> {
    if (!this.connector) throw new Error('SolanaAdapter:disconnect - No active connector');

    return this.connector.disconnect();
  }

  getSupportedNamespace(): ChainNamespace {
    return BitcoinAdapter.supportedNamespace;
  }

  async signMessage(address: string, message: string, chainId?: string): Promise<string> {
    if (!this.connector) throw new Error('BitcoinAdapter:signMessage - No active connector');

    const provider = this.connector.getProvider('bip122');
    if (!provider) throw new Error('BitcoinAdapter:signMessage - No active provider');

    const chain = chainId ? `${this.getSupportedNamespace()}:${chainId}` : undefined;

    const { signature } = (await provider.request(
      {
        method: 'signMessage',
        params: { message, account: address, address, protocol: 'ecdsa' }
      },
      chain
    )) as { address: string; signature: string };

    const formattedSignature = FormatUtil.normalizeSignature(signature);

    return formattedSignature.base64;
  }
}
