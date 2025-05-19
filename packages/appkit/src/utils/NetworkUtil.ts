import { ConstantsUtil } from '@reown/appkit-common-react-native';
import type { AppKitNetwork, CaipNetworkId, Network } from '@reown/appkit-common-react-native';

export const NetworkUtil = {
  formatNetwork(network: Network, projectId: string): AppKitNetwork {
    const formattedNetwork = {
      ...network,
      rpcUrls: { ...network.rpcUrls },
      chainNamespace: network.chainNamespace ?? 'eip155',
      caipNetworkId: network.caipNetworkId ?? `${network.chainNamespace ?? 'eip155'}:${network.id}`
    };

    Object.keys(formattedNetwork.rpcUrls).forEach(key => {
      const rpcConfig = formattedNetwork.rpcUrls[key];
      if (rpcConfig?.http?.some(url => url.includes(ConstantsUtil.BLOCKCHAIN_API_RPC_URL))) {
        formattedNetwork.rpcUrls[key] = {
          ...rpcConfig,
          http: [this.getBlockchainApiRpcUrl(formattedNetwork.caipNetworkId, projectId)]
        };
      }
    });

    return formattedNetwork;
  },

  formatNetworks(networks: Network[], projectId: string): AppKitNetwork[] {
    const formattedNetworks = networks.map(network => this.formatNetwork(network, projectId));

    return formattedNetworks;
  },

  getBlockchainApiRpcUrl(caipNetworkId: CaipNetworkId, projectId: string) {
    const url = new URL(`${ConstantsUtil.BLOCKCHAIN_API_RPC_URL}/v1/`);
    url.searchParams.set('chainId', caipNetworkId);
    url.searchParams.set('projectId', projectId);

    return url.toString();
  },

  getDefaultChainId(network?: AppKitNetwork): CaipNetworkId | undefined {
    if (!network) return undefined;

    if (network.caipNetworkId) {
      return network.caipNetworkId;
    }

    if (network.chainNamespace) {
      return `${network.chainNamespace}:${network.id}`;
    }

    return `eip155:${network.id}`;
  }
};
