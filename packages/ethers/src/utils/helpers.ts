import type { CaipNetworkId } from '@reown/scaffold-react-native';
import { PresetsUtil, ConstantsUtil } from '@reown/scaffold-utils-react-native';
import EthereumProvider from '@walletconnect/ethereum-provider';

export async function getWalletConnectCaipNetworks(provider?: EthereumProvider) {
  if (!provider) {
    throw new Error('networkControllerClient:getApprovedCaipNetworks - provider is undefined');
  }

  const ns = provider.signer?.session?.namespaces;
  const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods;
  const nsChains = ns?.[ConstantsUtil.EIP155]?.chains as CaipNetworkId[];

  return {
    supportsAllNetworks: Boolean(nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD)),
    approvedCaipNetworkIds: nsChains
  };
}

export function getEmailCaipNetworks() {
  return {
    supportsAllNetworks: false,
    approvedCaipNetworkIds: PresetsUtil.WalletConnectRpcChainIds.map(
      id => `${ConstantsUtil.EIP155}:${id}`
    ) as CaipNetworkId[]
  };
}
