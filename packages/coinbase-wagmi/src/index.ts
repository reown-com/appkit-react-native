import { ChainNotConfiguredError, createConnector } from 'wagmi';
import {
  getAddress,
  UserRejectedRequestError,
  numberToHex,
  ProviderRpcError,
  SwitchChainError
} from 'viem';
import { WalletMobileSDKEVMProvider, configure } from '@coinbase/wallet-mobile-sdk';
import type { WalletMobileSDKProviderOptions } from '@coinbase/wallet-mobile-sdk/build/WalletMobileSDKEVMProvider';
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-common-react-native';

type CoinbaseConnectorParameters = WalletMobileSDKProviderOptions & {
  redirect: string;
};

type Provider = WalletMobileSDKEVMProvider;

coinbaseConnector.type = 'COINBASE';
export function coinbaseConnector(parameters: CoinbaseConnectorParameters) {
  let _provider: Provider;

  return createConnector<Provider>(config => ({
    id: ConstantsUtil.COINBASE_CONNECTOR_ID,
    name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.COINBASE_CONNECTOR_ID]!,
    type: coinbaseConnector.type,
    async connect({ chainId } = {}) {
      try {
        const provider = await this.getProvider();
        let accounts;
        const isConnected = provider.connected;

        if (!isConnected) {
          accounts = (
            (await provider.request({
              method: 'eth_requestAccounts'
            })) as string[]
          ).map(getAddress);
        } else {
          accounts = provider.selectedAddress ? [getAddress(provider.selectedAddress)] : [];
        }

        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        provider.on('disconnect', this.onDisconnect.bind(this));

        // Switch to chain if provided
        let currentChainId = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain!({ chainId }).catch(() => ({
            id: currentChainId
          }));
          currentChainId = chain?.id ?? currentChainId;
        }

        return { accounts, chainId: currentChainId };
      } catch (error) {
        if (/(Error error 0|User rejected the request)/i.test((error as Error).message))
          throw new UserRejectedRequestError(error as Error);

        if (/(Error error 5|Could not open wallet)/i.test((error as Error).message))
          throw new Error(`Wallet not found. SDK Error: ${(error as Error).message}`);

        throw error;
      }
    },
    async disconnect() {
      const provider = await this.getProvider();

      provider.removeListener('accountsChanged', this.onAccountsChanged);
      provider.removeListener('chainChanged', this.onChainChanged);
      provider.removeListener('disconnect', this.onDisconnect.bind(this));

      provider.disconnect();
    },
    async getAccounts() {
      const provider = await this.getProvider();

      return (
        await provider.request<string[]>({
          method: 'eth_accounts'
        })
      ).map(getAddress);
    },
    async getChainId() {
      const provider = await this.getProvider();

      return Number(provider.chainId);
    },
    async getProvider({ chainId } = {}) {
      function initProvider() {
        configure({
          callbackURL: new URL(parameters.redirect),
          hostURL: new URL('https://wallet.coinbase.com/wsegue'),
          hostPackageName: 'org.toshi'
        });

        return new WalletMobileSDKEVMProvider({ ...parameters });
      }

      if (!_provider) {
        _provider = initProvider();
      }

      if (chainId) {
        await this.switchChain?.({ chainId });
      }

      return _provider;
    },
    async isAuthorized() {
      try {
        const accounts = await this.getAccounts();

        return !!accounts.length;
      } catch {
        return false;
      }
    },
    async switchChain({ chainId }) {
      const chain = config.chains.find(c => c.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      const provider = await this.getProvider();
      const chainId_ = numberToHex(chain.id);

      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId_ }]
        });

        return chain;
      } catch (error) {
        // Indicates chain is not added to provider
        if ((error as ProviderRpcError).code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainId_,
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [chain.rpcUrls.default?.http[0] ?? ''],
                  blockExplorerUrls: [chain.blockExplorers?.default.url]
                }
              ]
            });

            return chain;
          } catch (e) {
            throw new UserRejectedRequestError(e as Error);
          }
        }

        throw new SwitchChainError(error as Error);
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
    async onDisconnect(_error) {
      config.emitter.emit('disconnect');

      const provider = await this.getProvider();
      provider.removeListener('accountsChanged', this.onAccountsChanged);
      provider.removeListener('chainChanged', this.onChainChanged);
      provider.removeListener('disconnect', this.onDisconnect.bind(this));
    }
  }));
}
