import type { Namespace, NamespaceConfig } from '@walletconnect/universal-provider';
import {
  type AppKitNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  solana,
  solanaDevnet
} from '@reown/appkit-common-react-native';

export const DEFAULT_METHODS = {
  solana: [
    'solana_signMessage',
    'solana_signTransaction',
    'solana_requestAccounts',
    'solana_getAccounts',
    'solana_signAllTransactions',
    'solana_signAndSendTransaction'
  ],
  eip155: [
    'eth_accounts',
    'eth_requestAccounts',
    'eth_sendRawTransaction',
    'eth_sign',
    'eth_signTransaction',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'eth_sendTransaction',
    'personal_sign',
    'wallet_switchEthereumChain',
    'wallet_addEthereumChain',
    'wallet_getPermissions',
    'wallet_requestPermissions',
    'wallet_registerOnboarding',
    'wallet_watchAsset',
    'wallet_scanQRCode',
    // EIP-5792
    'wallet_getCallsStatus',
    'wallet_showCallsStatus',
    'wallet_sendCalls',
    'wallet_getCapabilities',
    // EIP-7715
    'wallet_grantPermissions',
    'wallet_revokePermissions',
    //EIP-7811
    'wallet_getAssets'
  ],
  bip122: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses']
};

export const WcHelpersUtil = {
  getMethodsByChainNamespace(chainNamespace: ChainNamespace): string[] {
    return DEFAULT_METHODS[chainNamespace as keyof typeof DEFAULT_METHODS] || [];
  },

  createDefaultNamespace(chainNamespace: ChainNamespace): Namespace {
    return {
      methods: this.getMethodsByChainNamespace(chainNamespace),
      events: ['accountsChanged', 'chainChanged'],
      chains: [],
      rpcMap: {}
    };
  },

  applyNamespaceOverrides(
    baseNamespaces: NamespaceConfig,
    overrides?: any //TODO: add OptionsControllerState['universalProviderConfigOverride']
  ): NamespaceConfig {
    if (!overrides) {
      return { ...baseNamespaces };
    }

    const result = { ...baseNamespaces };

    const namespacesToOverride = new Set<string>();

    if (overrides.methods) {
      Object.keys(overrides.methods).forEach(ns => namespacesToOverride.add(ns));
    }

    if (overrides.chains) {
      Object.keys(overrides.chains).forEach(ns => namespacesToOverride.add(ns));
    }

    if (overrides.events) {
      Object.keys(overrides.events).forEach(ns => namespacesToOverride.add(ns));
    }

    if (overrides.rpcMap) {
      Object.keys(overrides.rpcMap).forEach(chainId => {
        const [ns] = chainId.split(':');
        if (ns) {
          namespacesToOverride.add(ns);
        }
      });
    }

    namespacesToOverride.forEach(ns => {
      if (!result[ns]) {
        result[ns] = this.createDefaultNamespace(ns as ChainNamespace);
      }
    });

    if (overrides.methods) {
      Object.entries(overrides.methods).forEach(([ns, methods]) => {
        if (result[ns]) {
          //@ts-ignore
          result[ns].methods = methods;
        }
      });
    }

    if (overrides.chains) {
      Object.entries(overrides.chains).forEach(([ns, chains]) => {
        if (result[ns]) {
          //@ts-ignore
          result[ns].chains = chains;
        }
      });
    }

    if (overrides.events) {
      Object.entries(overrides.events).forEach(([ns, events]) => {
        if (result[ns]) {
          //@ts-ignore
          result[ns].events = events;
        }
      });
    }

    if (overrides.rpcMap) {
      const processedNamespaces = new Set<string>();

      Object.entries(overrides.rpcMap).forEach(([chainId, rpcUrl]) => {
        const [ns, id] = chainId.split(':');
        if (!ns || !id || !result[ns]) {
          return;
        }

        //@ts-ignore
        if (!result[ns].rpcMap) {
          //@ts-ignore
          result[ns].rpcMap = {};
        }

        //@ts-ignore
        if (!processedNamespaces.has(ns)) {
          //@ts-ignore
          result[ns].rpcMap = {};
          processedNamespaces.add(ns);
        }

        //@ts-ignore
        result[ns].rpcMap[id] = rpcUrl;
      });
    }

    return result;
  },

  createNamespaces(
    caipNetworks: AppKitNetwork[],
    configOverride?: any //TODO: fix this
  ): NamespaceConfig {
    const defaultNamespaces = caipNetworks.reduce<NamespaceConfig>((acc, chain) => {
      const { id, rpcUrls } = chain;
      const chainNamespace = chain.chainNamespace || 'eip155';
      const rpcUrl = rpcUrls.default.http[0];

      if (!acc[chainNamespace]) {
        acc[chainNamespace] = this.createDefaultNamespace(chainNamespace);
      }

      const caipNetworkId: CaipNetworkId = `${chainNamespace}:${id}`;

      const namespace = acc[chainNamespace];

      if (namespace) {
        //@ts-ignore
        namespace.chains.push(caipNetworkId);

        // Workaround for wallets that only support deprecated Solana network ID
        switch (caipNetworkId) {
          case solana.caipNetworkId:
            namespace.chains.push(solana.deprecatedCaipNetworkId as string);
            break;
          case solanaDevnet.caipNetworkId:
            namespace.chains.push(solanaDevnet.deprecatedCaipNetworkId as string);
            break;
          default:
        }

        if (namespace?.rpcMap && rpcUrl) {
          namespace.rpcMap[id] = rpcUrl;
        }
      }

      return acc;
    }, {});

    return this.applyNamespaceOverrides(defaultNamespaces, configOverride);
  }
};

export namespace WcHelpersUtil {
  export type SessionEventData = {
    id: string;
    topic: string;
    params: { chainId: string; event: { data: unknown; name: string } };
  };
}
