import { ConstantsUtil } from '@reown/appkit-common-react-native';
import type { AppKitNetwork, CaipNetworkId } from '@reown/appkit-common-react-native';

export const NetworkUtil = {
  //TODO: check this function
  formatNetworks(networks: AppKitNetwork[], projectId: string): AppKitNetwork[] {
    return networks.map(network => {
      const formattedNetwork = {
        ...network,
        rpcUrls: { ...network.rpcUrls }
      };

      Object.keys(formattedNetwork.rpcUrls).forEach(key => {
        const rpcConfig = formattedNetwork.rpcUrls[key];
        if (rpcConfig?.http?.some(url => url.includes(ConstantsUtil.BLOCKCHAIN_API_RPC_URL))) {
          formattedNetwork.rpcUrls[key] = {
            ...rpcConfig,
            http: [
              this.getBlockchainApiRpcUrl(
                network.caipNetworkId ?? `${network.chainNamespace ?? 'eip155'}:${network.id}`,
                projectId
              )
            ]
          };
        }
      });

      return formattedNetwork;
    });
  },

  getBlockchainApiRpcUrl(caipNetworkId: CaipNetworkId, projectId: string) {
    const url = new URL(`${ConstantsUtil.BLOCKCHAIN_API_RPC_URL}/v1/`);
    url.searchParams.set('chainId', caipNetworkId);
    url.searchParams.set('projectId', projectId);

    return url.toString();
  }
};
