import {
  SolanaBaseAdapter,
  WalletConnector,
  type AppKitNetwork,
  type CaipAddress,
  type GetBalanceParams,
  type GetBalanceResponse,
  type SignMessageParams,
  type SignMessageResult,
  type TransactionReceipt
} from '@reown/appkit-common-react-native';
import { Connection, PublicKey } from '@solana/web3.js';
import base58 from 'bs58';

export class SolanaAdapter extends SolanaBaseAdapter {
  private static supportedNamespace: string = 'solana';

  constructor(configParams: { projectId: string }) {
    super({
      projectId: configParams.projectId,
      supportedNamespace: SolanaAdapter.supportedNamespace
    });
  }

  async signMessage(params: SignMessageParams): Promise<SignMessageResult> {
    if (!this.connector) throw new Error('No active connector');

    const provider = this.connector.getProvider();
    if (!provider) throw new Error('No active provider');

    const { message } = params;

    // return this.request('eth_signTransaction', [tx]) as Promise<SignedTransaction>;
    // throw new Error('Method not implemented.');

    const signParams = {
      message: base58.encode(new TextEncoder().encode(message)),
      pubkey: params.address || this.getAccounts()?.[0] //TODO: Check if this is correct
    };

    const signature = (await provider.request({
      method: 'solana_signTransaction',
      params: [signParams]
    })) as any; //TODO: check type

    return { signature };
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
        address,
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
      // await provider.request({
      //   method: 'wallet_switchEthereumChain',
      //   params: [{ chainId: EthersHelpersUtil.numberToHexString(Number(network.id)) }] //TODO: check util
      // });

      this.getBalance({ address: this.getAccounts()?.[0], network });

      return;
    } catch (switchError: any) {
      // const message = switchError?.message as string;
      // if (/(?<temp1>user rejected)/u.test(message?.toLowerCase())) {
      //   throw new Error('Chain is not supported');
      // }
      // provider.request({
      //   method: 'wallet_addEthereumChain',
      //   params: [
      //     {
      //       chainId: EthersHelpersUtil.numberToHexString(Number(network.id)),
      //       rpcUrls: network.rpcUrls,
      //       chainName: network.name,
      //       nativeCurrency: network.nativeCurrency,
      //       blockExplorerUrls: network.blockExplorers,
      //       iconUrls: [PresetsUtil.NetworkImageIds[network.id]]
      //     }
      //   ]
      // });
    }
  }

  getAccounts(): CaipAddress[] | undefined {
    if (!this.connector) throw new Error('No active connector');
    const namespaces = this.connector.getNamespaces();

    return namespaces[this.getSupportedNamespace()]?.accounts;
  }

  sendTransaction(/*tx: TransactionData*/): Promise<TransactionReceipt> {
    throw new Error('Method not implemented.');
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

  getSupportedNamespace(): string {
    return SolanaAdapter.supportedNamespace;
  }

  onChainChanged(chainId: string): void {
    // console.log('SolanaAdapter - onChainChanged', chainId);
    this.emit('chainChanged', { chainId, namespace: this.getSupportedNamespace() });
  }

  onAccountsChanged(accounts: string[]): void {
    // console.log('SolanaAdapter - onAccountsChanged', accounts);
    // Emit this change to AppKit with the corresponding namespace.
    this.emit('accountsChanged', { accounts, namespace: this.getSupportedNamespace() });
  }

  onDisconnect(): void {
    // console.log('SolanaAdapter - onDisconnect');
    this.emit('disconnect', { namespace: this.getSupportedNamespace() });

    //the connector might be shared between adapters. Validate this
    const provider = this.connector?.getProvider();
    if (provider) {
      provider.off('chainChanged', this.onChainChanged.bind(this));
      provider.off('accountsChanged', this.onAccountsChanged.bind(this));
      provider.off('disconnect', this.onDisconnect.bind(this));
    }

    this.connector = undefined;
  }

  override setConnector(connector: WalletConnector): void {
    super.setConnector(connector);
    this.subscribeToEvents();
  }

  subscribeToEvents(): void {
    const provider = this.connector?.getProvider();
    if (!provider) return;

    // console.log('SolanaAdapter - subscribing to events');
    provider.on('chainChanged', this.onChainChanged.bind(this));
    provider.on('accountsChanged', this.onAccountsChanged.bind(this));
    provider.on('disconnect', this.onDisconnect.bind(this));
  }
}
