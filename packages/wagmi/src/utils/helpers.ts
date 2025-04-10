import { CoreHelperUtil } from '@reown/appkit-scaffold-react-native';
import {
  PresetsUtil,
  ConstantsUtil,
  type CaipNetwork,
  type CaipNetworkId
} from '@reown/appkit-common-react-native';
import type { Connector } from '@wagmi/core';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import type { AppKitClientOptions } from '../client';
import { http, type Hex } from 'viem';

export function getCaipDefaultChain(chain?: AppKitClientOptions['defaultChain']) {
  if (!chain) {
    return undefined;
  }

  return {
    id: `${ConstantsUtil.EIP155}:${chain.id}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.id]
  } as CaipNetwork;
}

export async function getWalletConnectCaipNetworks(connector?: Connector) {
  if (!connector) {
    throw new Error('networkControllerClient:getApprovedCaipNetworks - connector is undefined');
  }
  const provider = (await connector?.getProvider()) as Awaited<
    ReturnType<(typeof EthereumProvider)['init']>
  >;
  const ns = provider?.signer?.session?.namespaces;
  const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
  const nsChains = ns?.[ConstantsUtil.EIP155]?.chains as CaipNetworkId[];

  return {
    supportsAllNetworks: Boolean(nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD)),
    approvedCaipNetworkIds: nsChains
  };
}

export function getAuthCaipNetworks() {
  return {
    supportsAllNetworks: false,
    approvedCaipNetworkIds: PresetsUtil.RpcChainIds.map(
      id => `${ConstantsUtil.EIP155}:${id}`
    ) as CaipNetworkId[]
  };
}

export function getTransport({ chainId, projectId }: { chainId: number; projectId: string }) {
  const RPC_URL = CoreHelperUtil.getBlockchainApiUrl();

  if (!PresetsUtil.RpcChainIds.includes(chainId)) {
    return http();
  }

  return http(`${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chainId}&projectId=${projectId}`);
}

export function requireCaipAddress(caipAddress: string) {
  if (!caipAddress) {
    throw new Error('No CAIP address provided');
  }
  const account = caipAddress.split(':')[2] as Hex;
  if (!account) {
    throw new Error('Invalid CAIP address');
  }

  return account;
}
