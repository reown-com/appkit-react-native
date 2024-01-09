import { CoreHelperUtil } from '@web3modal/scaffold-react-native';
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils-react-native';
import type { Chain } from 'viem';

// -- Helpers ------------------------------------------------------------------
const RPC_URL = CoreHelperUtil.getBlockchainApiUrl();

// -- Types --------------------------------------------------------------------
interface Options {
  projectId: string;
}

// -- Provider -----------------------------------------------------------------
export function walletConnectProvider<C extends Chain = Chain>({ projectId }: Options) {
  return function provider(chain: C) {
    if (!PresetsUtil.WalletConnectRpcChainIds.includes(chain.id)) {
      return null;
    }

    const baseHttpUrl = `${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chain.id}&projectId=${projectId}`;

    return {
      chain: {
        ...chain,
        rpcUrls: {
          ...chain.rpcUrls,
          default: { http: [baseHttpUrl] }
        }
      } as C,
      rpcUrls: {
        http: [baseHttpUrl]
      }
    };
  };
}
