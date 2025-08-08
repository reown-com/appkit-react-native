import type { Provider, WalletConnector } from '@reown/appkit-common-react-native';
import {
  getAddress,
  numberToHex,
  SwitchChainError,
  UserRejectedRequestError,
  type Hex
} from 'viem';
import { ChainNotConfiguredError, createConnector, ProviderNotFoundError } from 'wagmi';
import { formatNetwork } from '../utils/helpers';

export function UniversalConnector(appKitProvidedConnector: WalletConnector) {
  let provider: Provider | undefined;

  let accountsChangedHandler: ((accounts: string[]) => void) | undefined;
  let chainChangedHandler: ((chainId: string | number) => void) | undefined;
  let disconnectHandler: ((error?: Error) => void) | undefined;

  type AppKitConnectorProperties = { ready: boolean };

  return createConnector<Provider, AppKitConnectorProperties>(config => ({
    id: 'walletconnect',
    name: 'WalletConnect',
    type: 'walletconnect' as const,
    ready: !!appKitProvidedConnector.getProvider('eip155'),

    async setup() {
      provider = appKitProvidedConnector.getProvider('eip155');
      if (provider?.on) {
        accountsChangedHandler = (accounts: string[]) => {
          const hexAccounts = accounts.map(acc => getAddress(acc));
          config.emitter.emit('change', { accounts: hexAccounts });
          if (hexAccounts.length === 0) {
            config.emitter.emit('disconnect');
          }
        };
        chainChangedHandler = (chainId: string | number) => {
          const newChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
          config.emitter.emit('change', { chainId: newChainId });
        };
        disconnectHandler = (error?: Error) => {
          config.emitter.emit('disconnect');
          if (error) config.emitter.emit('error', { error });
        };

        if (accountsChangedHandler) provider.on('accountsChanged', accountsChangedHandler);
        if (chainChangedHandler) provider.on('chainChanged', chainChangedHandler);
        if (disconnectHandler) provider.on('disconnect', disconnectHandler);
        if (disconnectHandler) provider.on('session_delete', disconnectHandler);
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

        this.ready = true;

        return { accounts: accountAddresses, chainId: currentChainId };
      } catch (error) {
        if (error instanceof UserRejectedRequestError) throw error;
        throw new UserRejectedRequestError(error as Error); // Generalize other errors as user rejection for simplicity
      }
    },

    async disconnect() {
      await appKitProvidedConnector.disconnect();
      config.emitter.emit('message', { type: 'externalDisconnect' });
      if (provider?.off && accountsChangedHandler && chainChangedHandler && disconnectHandler) {
        provider.off('accountsChanged', accountsChangedHandler);
        provider.off('chainChanged', chainChangedHandler);
        provider.off('disconnect', disconnectHandler);
        provider.off('session_delete', disconnectHandler);
        accountsChangedHandler = undefined;
        chainChangedHandler = undefined;
        disconnectHandler = undefined;
      }
      this.ready = false;
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

      return provider as Provider;
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

        config.emitter.emit('change', { chainId });

        return newChain;
      } catch (error) {
        // Try to add chain if switch failed (common pattern)
        //4902 in MetaMask: Unrecognized chain ID
        if ((error as any)?.code === 4902 || (error as any)?.data?.originalError?.code === 4902) {
          try {
            await _provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: numberToHex(chainId),
                  chainName: newChain.name,
                  nativeCurrency: newChain.nativeCurrency,
                  rpcUrls: [newChain.rpcUrls.default?.http[0] ?? ''], // Take first default HTTP RPC URL
                  blockExplorerUrls: [newChain.blockExplorers?.default?.url]
                }
              ]
            });
            await appKitProvidedConnector.switchNetwork(formatNetwork(newChain));
            config.emitter.emit('change', { chainId });

            return newChain;
          } catch (addError) {
            throw new UserRejectedRequestError(addError as Error);
          }
        }
        throw new SwitchChainError(error as Error);
      }
    },

    onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) this.onDisconnect();
      else config.emitter.emit('change', { accounts: accounts.map(x => getAddress(x)) });
    },

    onChainChanged(chain: string) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },

    onDisconnect: () => {
      config.emitter.emit('disconnect');
    }
  }));
}
