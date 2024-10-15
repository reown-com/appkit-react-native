import { createConnector, ChainNotConfiguredError } from 'wagmi';
import { SwitchChainError, getAddress, type Address, type Hex } from 'viem';

import { AppKitFrameProvider } from '@reown/appkit-wallet-react-native';
import { NetworkUtil } from '@reown/appkit-common-react-native';

export type Metadata = {
  name: string;
  description: string;
  url: string;
  icons: string[];
};

type AuthConnectorOptions = {
  /**
   * Reown Cloud Project ID.
   * @link https://cloud.reown.com/sign-in.
   */
  projectId: string;
  metadata: Metadata;
};

type Provider = AppKitFrameProvider;

type StorageItemMap = {
  '@w3m/connected_connector'?: string;
};

authConnector.type = 'appKitAuth' as const;
authConnector.id = 'appKitAuth' as const;
export function authConnector(parameters: AuthConnectorOptions) {
  let _provider: AppKitFrameProvider = {} as AppKitFrameProvider;
  let _currentAddress: Address | null = null;
  let _chainId: number | null = null;

  function parseChainId(chainId: string | number) {
    return NetworkUtil.parseEvmChainId(chainId) || 1;
  }

  return createConnector<Provider, {}, StorageItemMap>(config => ({
    id: authConnector.id,
    name: 'AppKit Auth',
    type: authConnector.type,
    async setup() {
      _provider = new AppKitFrameProvider(parameters.projectId, parameters.metadata);
    },
    async connect(options = {}) {
      const provider = await this.getProvider();
      let chainId = options.chainId;
      await provider.webviewLoadPromise;

      if (options.isReconnecting) {
        chainId = await provider.getLastUsedChainId();
        if (!chainId) {
          throw new Error('ChainId not found in provider');
        }
      }

      const { address, chainId: frameChainId } = await provider.connect({ chainId });

      _chainId = frameChainId as number;
      _currentAddress = address as Address;

      const parsedChainId = parseChainId(frameChainId);

      return {
        accounts: [_currentAddress as Address],
        account: _currentAddress as Address,
        chainId: parsedChainId,
        chain: {
          id: parsedChainId,
          unsuported: false
        }
      };
    },
    async disconnect() {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;
      await provider.disconnect();
      _chainId = null;
      _currentAddress = null;
    },
    async switchChain({ chainId }) {
      try {
        const chain = config.chains?.find(c => c.id === chainId);
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

        const provider = await this.getProvider();
        await provider.webviewLoadPromise;

        // We connect instead, since changing the chain may cause the address to change as well
        const response = await provider.connect({ chainId });

        config.emitter.emit('change', {
          chainId: Number(chainId),
          accounts: [response.address as Hex]
        });
        _chainId = chainId;

        return chain;
      } catch (error) {
        if (error instanceof Error) {
          throw new SwitchChainError(error);
        }
        throw error;
      }
    },
    async getAccounts() {
      if (_currentAddress) return [_currentAddress];

      const provider = await this.getProvider();
      await provider.webviewLoadPromise;

      return (
        await provider.request({
          method: 'eth_accounts'
        })
      ).map(getAddress);
    },
    async getChainId() {
      if (_chainId) return _chainId;

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

        if (connectedConnector !== authConnector.id) {
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
      else {
        const account = accounts[0] ? getAddress(accounts[0]) : null;
        config.emitter.emit('change', { accounts: account ? [account] : undefined });
        _currentAddress = account;
      }
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
      _chainId = chainId;
    },
    async onDisconnect() {
      const provider = await this.getProvider();
      await provider.webviewLoadPromise;
      await provider.disconnect();
      config.emitter.emit('disconnect');
    }
  }));
}
