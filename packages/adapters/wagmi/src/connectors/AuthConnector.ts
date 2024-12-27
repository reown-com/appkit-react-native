import type { Address } from 'viem';
import { SwitchChainError, getAddress } from 'viem';
import { createConnector, type CreateConfigParameters } from '@wagmi/core';

import { AppKitFrameProvider } from '@reown/appkit-wallet-react-native';
import {
  ConstantsUtil as CommonConstantsUtil,
  NetworkUtil
} from '@reown/appkit-common-react-native';
import { ErrorUtil } from '@reown/appkit-utils-react-native';
import { SnackController, type Metadata } from '@reown/appkit-core-react-native';
import { AppKitFrameProviderSingleton } from '@reown/appkit-react-native';

// -- Types ----------------------------------------------------------------------------------------
export interface AppKitFrameProviderOptions {
  projectId: string;
  metadata: Metadata;
}

export type AuthParameters = {
  chains?: CreateConfigParameters['chains'];
  options: AppKitFrameProviderOptions;
};

// -- Connector ------------------------------------------------------------------------------------
export function authConnector(parameters: AuthParameters) {
  let currentAccounts: Address[] = [];

  type Properties = {
    provider?: AppKitFrameProvider;
  };

  function parseChainId(chainId: string | number) {
    return NetworkUtil.parseEvmChainId(chainId) || 1;
  }

  return createConnector<AppKitFrameProvider, Properties>(config => ({
    id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
    name: 'AppKit Auth',
    type: 'AUTH',
    chain: CommonConstantsUtil.CHAIN.EVM,

    async connect(options = {}) {
      const provider = await this.getProvider();
      let chainId = options.chainId;

      if (options.isReconnecting) {
        chainId = await provider.getLastUsedChainId();
        if (!chainId) {
          throw new Error('ChainId not found in provider');
        }
      }
      const {
        address,
        chainId: frameChainId,
        accounts
      } = await provider.connect({
        chainId
      });

      currentAccounts = accounts?.map(a => a.address as Address) || [address as Address];

      await provider.getSmartAccountEnabledNetworks();

      const parsedChainId = parseChainId(frameChainId);

      return {
        accounts: currentAccounts,
        account: address as Address,
        chainId: parsedChainId,
        chain: {
          id: parsedChainId,
          unsuported: false
        }
      };
    },

    async disconnect() {
      const provider = await this.getProvider();
      await provider.disconnect();
    },

    getAccounts() {
      if (!currentAccounts?.length) {
        return Promise.resolve([]);
      }

      config.emitter.emit('change', { accounts: currentAccounts });

      return Promise.resolve(currentAccounts);
    },

    async getProvider() {
      if (!this.provider) {
        this.provider = AppKitFrameProviderSingleton.getInstance({
          projectId: parameters.options.projectId,
          metadata: parameters.options.metadata,
          onTimeout: () => {
            SnackController.showInternalError(ErrorUtil.ALERT_ERRORS.SOCIALS_TIMEOUT);
          }
        });
      }
      await this.provider.webviewLoadPromise;
      return Promise.resolve(this.provider);
    },

    async getChainId() {
      const provider: AppKitFrameProvider = await this.getProvider();
      const { chainId } = await provider.getChainId();

      return parseChainId(chainId);
    },

    async isAuthorized() {
      const provider = await this.getProvider();
      return Promise.resolve(Boolean(provider.getEmail()));
    },

    async switchChain({ chainId }) {
      try {
        const chain = config.chains.find(c => c.id === chainId);
        if (!chain) {
          throw new SwitchChainError(new Error('chain not found on connector.'));
        }
        const provider = await this.getProvider();
        // We connect instead, since changing the chain may cause the address to change as well
        const response = await provider.connect({ chainId });

        currentAccounts = response?.accounts?.map(a => a.address as Address) || [
          response.address as Address
        ];

        config.emitter.emit('change', {
          chainId: Number(chainId),
          accounts: currentAccounts
        });

        return chain;
      } catch (error) {
        if (error instanceof Error) {
          throw new SwitchChainError(error);
        }
        throw error;
      }
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.onDisconnect();
      } else {
        config.emitter.emit('change', { accounts: accounts.map(getAddress) });
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },

    async onDisconnect(_error) {
      const provider = await this.getProvider();
      await provider.disconnect();
    }
  }));
}
