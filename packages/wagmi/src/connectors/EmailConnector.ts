import { type Chain, type ConnectorData, Connector } from 'wagmi';
import { SwitchChainError, createWalletClient, custom, getAddress } from 'viem';
import { W3mFrameProvider } from '@web3modal/email-react-native';

export type StorageStoreData = {
  state: { data?: ConnectorData };
};

interface Config {
  chains?: Chain[];
  options: EmailProviderOptions;
}

type EmailProviderOptions = {
  /**
   * WalletConnect Cloud Project ID.
   * @link https://cloud.walletconnect.com/sign-in.
   */
  projectId: string;
};

export class EmailConnector extends Connector<W3mFrameProvider, EmailProviderOptions> {
  readonly id = 'w3mEmail';
  readonly name = 'Web3Modal Email';
  readonly ready = true;

  private provider: W3mFrameProvider = {} as W3mFrameProvider;

  constructor(config: Config) {
    super(config);
    this.provider = new W3mFrameProvider();
  }

  async connect(options: { chainId?: number }): Promise<Required<ConnectorData>> {
    const { address, chainId } = await this.provider.connect({ chainId: options?.chainId });

    return {
      account: address as `0x${string}`,
      chain: {
        id: chainId,
        unsupported: this.isChainUnsupported(1)
      }
    };
  }

  async disconnect(): Promise<void> {
    await this.provider.disconnect();
  }

  override async switchChain(chainId: number): Promise<Chain> {
    try {
      const chain = this.chains?.find(c => c.id === chainId);
      if (!chain) {
        throw new SwitchChainError(new Error('chain not found on connector.'));
      }

      await this.provider.switchNetwork(chainId);
      const unsupported = this.isChainUnsupported(chainId);
      this.emit('change', { chain: { id: chainId, unsupported } });

      return chain;
    } catch (error) {
      if (error instanceof Error) {
        throw new SwitchChainError(error);
      }
      throw error;
    }
  }

  async getAccount(): Promise<`0x${string}`> {
    const { address } = await this.provider.connect();

    return address as `0x${string}`;
  }

  async getChainId(): Promise<number> {
    const { chainId } = await this.provider.getChainId();

    return chainId;
  }

  async getProvider() {
    return Promise.resolve(this.provider);
  }

  async getWalletClient() {
    const { address, chainId } = await this.provider.connect();

    return Promise.resolve(
      createWalletClient({
        account: address as `0x${string}`,
        chain: { id: chainId } as Chain,
        transport: custom(this.provider)
      })
    );
  }

  async isAuthorized(): Promise<boolean> {
    const { isConnected } = await this.provider.isConnected();

    return isConnected;
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(accounts[0]!) });
  };

  protected onChainChanged = (chainId: number | string) => {
    const id = Number(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  async onDisconnect() {
    const provider = await this.getProvider();
    await provider.disconnect();
    this.emit('disconnect');
  }
}
