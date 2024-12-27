import type { CaipNetwork, CaipNetworkId, ChainNamespace } from './TypeUtil';

export const NetworkUtil = {
  caipNetworkIdToNumber(caipnetworkId?: `${string}:${string}`) {
    return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined;
  },

  parseEvmChainId(chainId: string | number) {
    return typeof chainId === 'string'
      ? this.caipNetworkIdToNumber(chainId as CaipNetworkId)
      : chainId;
  },

  getNetworksByNamespace(networks: CaipNetwork[] | undefined, namespace: ChainNamespace) {
    return networks?.filter(network => network.chainNamespace === namespace) || [];
  }
};
