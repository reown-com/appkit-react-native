import { createConnector, ChainNotConfiguredError } from 'wagmi';
import { SwitchChainError, getAddress, type Address } from 'viem';

import { W3mFrameProvider } from '@web3modal/email-react-native';

export type Metadata = {
  name: string;
  description: string;
  url: string;
  icons: string[];
};

type EmailProviderOptions = {
  /**
   * WalletConnect Cloud Project ID.
   * @link https://cloud.walletconnect.com/sign-in.
   */
  projectId: string;
  metadata: Metadata;
};

type Provider = W3mFrameProvider;

type StorageItemMap = {
  '@w3m/connected_connector'?: string;
};

emailConnector.type = 'w3mEmail' as const;
emailConnector.id = 'w3mEmail' as const;
export function emailConnector(parameters: EmailProviderOptions) {
  let _provider: W3mFrameProvider = {} as W3mFrameProvider;

  return createConnector<Provider, {}, StorageItemMap>(config => ({
    id: emailConnector.id,
    name: 'Web3Modal Email',
    type: emailConnector.type,
    async setup() {
      _provider = new W3mFrameProvider(parameters.projectId, parameters.metadata);
    },
    async connect(options = {}) {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;
      const { address, chainId } = await provider.connect({ chainId: options.chainId });

      return {
        accounts: [address as Address],
        account: address as Address,
        chainId,
        chain: {
          id: chainId,
          unsuported: false
        }
      };
    },
    async disconnect() {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;
      await provider.disconnect();
    },
    async switchChain({ chainId }) {
      try {
        const chain = config.chains?.find(c => c.id === chainId);
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

        const provider = await this.getProvider();
        await provider.webviewLoadPromise;
        await provider.switchNetwork(chainId);
        config.emitter.emit('change', { chainId: Number(chainId) });

        return chain;
      } catch (error) {
        if (error instanceof Error) {
          throw new SwitchChainError(error);
        }
        throw error;
      }
    },
    async getAccounts() {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;

      return (
        await provider.request({
          method: 'eth_accounts'
        })
      ).map(getAddress);
    },
    async getChainId() {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;
      const { chainId } = await provider.getChainId();

      return chainId;
    },
    async getProvider() {
      return Promise.resolve(_provider);
    },
    async isAuthorized() {
      try {
        const provider = await this.getProvider();
        await provider.webviewLoadPromise;
        const connectedConnector = await config.storage?.getItem('recentConnectorId');

        if (connectedConnector !== emailConnector.id) {
          // isConnected still needs to be called to disable email input loader
          provider.isConnected();

          return false;
        } else {
          const { isConnected } = await provider.isConnected();

          return isConnected;
        }
      } catch (error) {
        return false;
      }
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0) config.emitter.emit('disconnect');
      else config.emitter.emit('change', { accounts: accounts.map(getAddress) });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },
    async onDisconnect() {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;
      await provider.disconnect();
      config.emitter.emit('disconnect');
    }
  }));
}
