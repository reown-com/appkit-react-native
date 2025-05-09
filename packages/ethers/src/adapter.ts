import { formatEther, JsonRpcProvider } from 'ethers';
import {
  EVMAdapter,
  type AppKitNetwork,
  type CaipAddress,
  type ChainNamespace,
  type GetBalanceParams,
  type GetBalanceResponse
} from '@reown/appkit-common-react-native';
import { EthersHelpersUtil } from '@reown/appkit-scaffold-utils-react-native';

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

    let balance = { amount: '0.00', symbol: network.nativeCurrency.symbol || 'ETH' };

    if (!balanceAddress) {
      return Promise.resolve(balance);
    }

    const account = balanceAddress.split(':')[2];

    try {
      const jsonRpcProvider = new JsonRpcProvider(network.rpcUrls.default.http[0], {
        chainId: Number(network.id),
        name: network.name
      });

      if (jsonRpcProvider && account) {
        const _balance = await jsonRpcProvider.getBalance(account);
        const formattedBalance = formatEther(_balance);

        balance = { amount: formattedBalance, symbol: network.nativeCurrency.symbol || 'ETH' };
      }

      this.emit('balanceChanged', {
        namespace: this.getSupportedNamespace(),
        address: balanceAddress,
        balance
      });

      return balance;
    } catch (error) {
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

  async request(method: string, params?: any[]) {
    if (!this.connector) throw new Error('No active connector');
    const provider = this.connector.getProvider();

    return provider.request({ method, params });
  }

  getSupportedNamespace(): ChainNamespace {
    return EthersAdapter.supportedNamespace;
  }
}
