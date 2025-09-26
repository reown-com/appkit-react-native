import type { Provider, WalletConnector } from '@reown/appkit-common-react-native';

import {
  getAddress,
  numberToHex,
  RpcError,
  SwitchChainError,
  UserRejectedRequestError,
  type Hex
} from 'viem';
import {
  ChainNotConfiguredError,
  createConnector,
  ProviderNotFoundError,
  type Connector
} from 'wagmi';

type UniversalConnector = Connector & {
  onSessionDelete(data: { topic: string }): void;
};

type Properties = {
  onSessionDelete(data: { topic: string }): void;
};

export function UniversalConnector(appKitProvidedConnector: WalletConnector) {
  let provider: Provider | undefined;

  let accountsChanged: UniversalConnector['onAccountsChanged'] | undefined;
  let chainChanged: UniversalConnector['onChainChanged'] | undefined;
  let sessionDelete: UniversalConnector['onSessionDelete'] | undefined;
  let disconnect: UniversalConnector['onDisconnect'] | undefined;

  return createConnector<Provider, Properties>(config => ({
    id: 'walletconnect',
    name: 'WalletConnect',
    type: 'walletconnect' as const,
    ready: !!appKitProvidedConnector.getProvider('eip155'),

    async setup() {
      const _provider = await this.getProvider().catch(() => null);
      if (!_provider) {
        return;
      }
      if (!sessionDelete) {
        sessionDelete = this.onSessionDelete.bind(this);
        _provider.on('session_delete', sessionDelete);
      }
    },

    async connect({ chainId } = {}) {
      try {
        const _provider = appKitProvidedConnector.getProvider('eip155');
        if (!_provider) throw new ProviderNotFoundError();

        // AppKit connector is already connected or handles its own connection.
        // We just need to sync its state with Wagmi.
        const accountAddresses = await this.getAccounts();
        if (!accountAddresses || accountAddresses.length === 0) {
          throw new UserRejectedRequestError(
            new Error('No accounts found or user rejected connection via AppKit.')
          );
        }

        let currentChainId = await this.getChainId();

        // Handle chain switching if requested and different
        if (chainId && currentChainId !== chainId) {
          await this.switchChain?.({ chainId });
          currentChainId = chainId;
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          _provider.on('accountsChanged', accountsChanged);
        }
        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this);
          _provider.on('chainChanged', chainChanged);
        }
        if (!disconnect) {
          disconnect = this.onDisconnect.bind(this);
          _provider.on('disconnect', disconnect);
        }
        if (!sessionDelete) {
          sessionDelete = this.onSessionDelete.bind(this);
          _provider.on('session_delete', sessionDelete);
        }

        return { accounts: accountAddresses, chainId: currentChainId };
      } catch (error) {
        if (error instanceof UserRejectedRequestError) throw error;
        throw new UserRejectedRequestError(error as Error); // Generalize other errors as user rejection for simplicity
      }
    },

    async disconnect() {
      const _provider = await this.getProvider().catch(() => null);
      try {
        await appKitProvidedConnector.disconnect();
        config.emitter.emit('message', { type: 'externalDisconnect' });
      } catch (error) {
        if (!/No matching key/i.test((error as Error).message)) {
          throw error;
        }
      } finally {
        if (chainChanged) {
          _provider?.off('chainChanged', chainChanged);
          chainChanged = undefined;
        }
        if (disconnect) {
          _provider?.off('disconnect', disconnect);
          disconnect = undefined;
        }
        if (accountsChanged) {
          _provider?.off('accountsChanged', accountsChanged);
          accountsChanged = undefined;
        }
        if (sessionDelete) {
          _provider?.off('session_delete', sessionDelete);
          sessionDelete = undefined;
        }
      }
    },

    async getAccounts() {
      const namespaces = appKitProvidedConnector.getNamespaces();
      // @ts-ignore
      const eip155Accounts = namespaces?.eip155?.accounts;
      if (!eip155Accounts) return [] as readonly Hex[];

      return eip155Accounts
        .map((caipAddr: string) => {
          const parts = caipAddr.split(':');

          return parts.length === 3 ? parts[2] : null;
        })
        .filter((addrPart): addrPart is string => !!addrPart)
        .map((addrPart: string) => getAddress(addrPart)) as readonly Hex[];
    },

    async getChainId() {
      const chainId = appKitProvidedConnector.getChainId('eip155')?.split(':')[1];

      if (chainId) return parseInt(chainId, 10);

      // Fallback: Try to get from CAIP accounts if available
      const namespaces = appKitProvidedConnector.getNamespaces();
      // @ts-ignore
      const eip155Accounts = namespaces?.eip155?.accounts;
      if (eip155Accounts && eip155Accounts.length > 0) {
        const parts = eip155Accounts[0]?.split(':');
        if (parts && parts.length > 1 && typeof parts[1] === 'string') {
          const chainIdNum = parseInt(parts[1], 10);
          if (!isNaN(chainIdNum)) {
            return chainIdNum;
          }
        }
      }
      if (config.chains && config.chains.length > 0) return config.chains[0].id;
      throw new Error('Unable to determine chainId.');
    },

    async getProvider() {
      if (!provider) {
        provider = appKitProvidedConnector.getProvider('eip155');
      }

      return provider;
    },

    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();

        return !!(accounts && accounts.length > 0);
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }) {
      const _provider = appKitProvidedConnector.getProvider('eip155');
      if (!_provider) throw new Error('Provider not available for switching chain.');
      const newChain = config.chains.find(c => c.id === chainId);

      if (!newChain) throw new SwitchChainError(new ChainNotConfiguredError());

      try {
        await _provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: numberToHex(chainId) }]
        });

        return newChain;
      } catch (err) {
        const error = err as RpcError;

        if (/(user rejected)/i.test(error.message)) throw new UserRejectedRequestError(error);

        if ((error as any)?.code === 4902 || (error as any)?.data?.originalError?.code === 4902) {
          // Indicates chain is not added to provider
          try {
            const addEthereumChainParams = {
              chainId: numberToHex(chainId),
              chainName: newChain.name,
              nativeCurrency: newChain.nativeCurrency,
              rpcUrls: [newChain.rpcUrls.default?.http[0] ?? ''],
              blockExplorerUrls: [newChain.blockExplorers?.default?.url]
            };

            await _provider.request({
              method: 'wallet_addEthereumChain',
              params: [addEthereumChainParams]
            });

            return newChain;
          } catch (addError) {
            throw new UserRejectedRequestError(addError as Error);
          }
        }
        throw new SwitchChainError(error as Error);
      }
    },

    onAccountsChanged(accounts: string[]) {
      //Only emit if the account is an evm account
      const shouldEmit = accounts.some(account => account.startsWith('0x'));

      if (accounts.length === 0) this.onDisconnect();
      else if (shouldEmit)
        config.emitter.emit('change', { accounts: accounts.map(x => getAddress(x)) });
    },

    onChainChanged(chain: string) {
      const chainId = Number(chain);

      //Only emit if the chain is in the config (evm)
      const shouldEmit = config.chains.some(c => c.id === chainId);
      if (shouldEmit) {
        config.emitter.emit('change', { chainId });
      }
    },

    async onDisconnect() {
      config.emitter.emit('disconnect');

      try {
        const _provider = await this.getProvider();

        // Clean up event listeners
        if (accountsChanged) {
          _provider.off('accountsChanged', accountsChanged);
          accountsChanged = undefined;
        }
        if (chainChanged) {
          _provider.off('chainChanged', chainChanged);
          chainChanged = undefined;
        }
        if (disconnect) {
          _provider.off('disconnect', disconnect);
          disconnect = undefined;
        }
        if (sessionDelete) {
          _provider.off('session_delete', sessionDelete);
          sessionDelete = undefined;
        }
      } catch (error) {
        // If provider is not available, still clean up local references
        // to prevent memory leaks
        if (accountsChanged) {
          accountsChanged = undefined;
        }
        if (chainChanged) {
          chainChanged = undefined;
        }
        if (disconnect) {
          disconnect = undefined;
        }
        if (sessionDelete) {
          sessionDelete = undefined;
        }
      }
    },

    onSessionDelete() {
      this.onDisconnect();
    }
  }));
}
