import {
  EVMAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { EthersHelpersUtil } from '@reown/appkit-scaffold-utils-react-native';
import { formatEther, getEthBalance } from './helpers';

export class EthersAdapter extends EVMAdapter {
  private static supportedNamespace: ChainNamespace = 'eip155';

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: EthersAdapter.supportedNamespace
    });
  }

  async getBalance(params: GetBalanceParams): Promise<GetBalanceResponse> {
    const { network, address } = params;

    if (!this.connector) throw new Error('No active connector');
    if (!network) throw new Error('No network provided');

    const balanceAddress =
      address || this.getAccounts()?.find(account => account.includes(network.id.toString()));

    const balance: GetBalanceResponse = {
      amount: '0.00',
      symbol: network.nativeCurrency.symbol || 'ETH'
    };

    if (!balanceAddress) return balance;

    const account = balanceAddress.split(':')[2];
    const rpcUrl = network.rpcUrls.default.http?.[0];
    if (!rpcUrl || !account) return balance;

    try {
      const wei = await getEthBalance(rpcUrl, account);
      balance.amount = formatEther(wei);

      this.emit('balanceChanged', {
        namespace: this.getSupportedNamespace(),
        address: balanceAddress,
        balance
      });

      return balance;
    } catch {
      return balance;
    }
  }

  async switchNetwork(network: AppKitNetwork): Promise<void> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider();
    if (!provider) throw new Error('No active provider');

    try {
      await provider.request(
        {
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: EthersHelpersUtil.numberToHexString(Number(network.id)) }] //TODO: check util
        },
        `${network.chainNamespace ?? 'eip155'}:${network.id}`
      );
    } catch (switchError: any) {
      const message = switchError?.message as string;
      if (/(?<temp1>user rejected)/u.test(message?.toLowerCase())) {
        throw new Error('Chain is not supported');
      }

      throw switchError;
    }
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
  }

  disconnect(): Promise<void> {
    if (!this.connector) throw new Error('EthersAdapter:disconnect - No active connector');

    return this.connector.disconnect();
  }

  getSupportedNamespace(): ChainNamespace {
    return EthersAdapter.supportedNamespace;
  }
}
