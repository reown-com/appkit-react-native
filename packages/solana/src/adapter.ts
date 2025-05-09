import {
  SolanaBaseAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { Connection, PublicKey } from '@solana/web3.js';

export class SolanaAdapter extends SolanaBaseAdapter {
  private static supportedNamespace: ChainNamespace = 'solana';

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: SolanaAdapter.supportedNamespace
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address } = params;

    if (!this.connector) throw new Error('No active connector');
    if (!network) throw new Error('No network provided');

    const balanceAddress =
      address || this.getAccounts()?.find(account => account.includes(network.id.toString()));

    if (!balanceAddress) {
      return Promise.resolve({ amount: '0.00', symbol: 'SOL' });
    }

    try {
      const connection = new Connection(network?.rpcUrls?.default?.http?.[0] as string); //TODO: check connection settings
      const balanceAmount = await connection.getBalance(
        new PublicKey(balanceAddress.split(':')[2] as string)
      );
      const formattedBalance = (balanceAmount / 1000000000).toString(); //TODO: add util with LAMPORTS_PER_SOL

      const balance = {
        amount: formattedBalance,
        symbol: network?.nativeCurrency.symbol || 'SOL'
      };

      this.emit('balanceChanged', {
        namespace: this.getSupportedNamespace(),
        address: balanceAddress,
        balance
      });

      return balance;
    } catch (error) {
      return { amount: '0.00', symbol: 'SOL' };
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

  async request(method: string, params?: any[]) {
    if (!this.connector) throw new Error('No active connector');
    const provider = this.connector.getProvider();

    return provider.request({ method, params });
  }

  getSupportedNamespace(): ChainNamespace {
    return SolanaAdapter.supportedNamespace;
  }
}
