import {
  SolanaBaseAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { getSolanaNativeBalance, getSolanaTokenBalance } from './helpers';

export class SolanaAdapter extends SolanaBaseAdapter {
  private static supportedNamespace: ChainNamespace = 'solana';

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: SolanaAdapter.supportedNamespace,
      adapterType: 'solana'
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address, tokens } = params;

    if (!this.connector) throw new Error('No active connector');
    if (!network) throw new Error('No network provided');

    const balanceAddress =
      address || this.getAccounts()?.find(account => account.includes(network.id.toString()));

    if (!balanceAddress) {
      return { amount: '0.00', symbol: 'SOL' };
    }

    try {
      const rpcUrl = network.rpcUrls?.default?.http?.[0];
      if (!rpcUrl) throw new Error('No RPC URL available');

      const base58Address = balanceAddress.split(':')[2];

      if (!base58Address) throw new Error('Invalid balance address');

      const token = network?.caipNetworkId && tokens?.[network.caipNetworkId]?.address;
      let balance;

      if (token) {
        const { amount, symbol } = await getSolanaTokenBalance(rpcUrl, base58Address, token);
        balance = {
          amount,
          symbol
        };
      } else {
        const amount = await getSolanaNativeBalance(rpcUrl, base58Address);
        balance = {
          amount: amount.toString(),
          symbol: 'SOL'
        };
      }

      this.emit('balanceChanged', { address: balanceAddress, balance });

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
    if (!this.connector) throw new Error('No active connector');

    return this.connector.disconnect();
  }

  getSupportedNamespace(): ChainNamespace {
    return SolanaAdapter.supportedNamespace;
  }
}
