import {
  type AppKitNetwork,
  type CaipNetworkId,
  type CaipNamespaces,
  ConstantsUtil,
  type Network
} from '@reown/appkit-common-react-native';

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

  getDefaultNetwork(
    namespaces: CaipNamespaces,
    defaultNetwork?: AppKitNetwork
  ): AppKitNetwork | undefined {
    if (!defaultNetwork) return undefined;

    const isValidDefaultNetwork = Object.values(namespaces).some(
      namespace => namespace?.chains?.some(chain => chain === defaultNetwork.caipNetworkId)
    );
    if (isValidDefaultNetwork) {
      return defaultNetwork;
    }

    return undefined;
  }
};
