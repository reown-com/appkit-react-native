import { CoreHelperUtil } from '@reown/appkit-react-native';
import {
  PresetsUtil,
  ConstantsUtil,
  type AppKitNetwork,
  type Network
} from '@reown/appkit-common-react-native';
import { http } from 'viem';

export function getTransport({ chainId, projectId }: { chainId: number; projectId: string }) {
  const RPC_URL = CoreHelperUtil.getBlockchainApiUrl();

  if (!PresetsUtil.RpcChainIds.includes(chainId)) {
    return http();
  }

  return http(`${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chainId}&projectId=${projectId}`);
}

export function formatNetwork(network: Network): AppKitNetwork {
  return {
    ...network,
    rpcUrls: { ...network.rpcUrls },
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${network.id}`
  };
}

export function formatNetworks(networks: Network[]): AppKitNetwork[] {
  return networks.map(formatNetwork);
}
