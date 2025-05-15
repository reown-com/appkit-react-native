import {
  BlockchainAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { BitcoinApi } from './utils/BitcoinApi';
import { UnitsUtil } from './utils/UnitsUtil';

export class BitcoinAdapter extends BlockchainAdapter {
  private static supportedNamespace: ChainNamespace = 'bip122';
  private static api = BitcoinApi;

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: BitcoinAdapter.supportedNamespace
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
        namespace: this.getSupportedNamespace(),
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

    const provider = this.connector.getProvider();
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
}
