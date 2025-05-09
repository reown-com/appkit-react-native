import { CoreHelperUtil } from '@reown/appkit-react-native';
import { PresetsUtil, ConstantsUtil } from '@reown/appkit-common-react-native';
import { http } from 'viem';

export function getTransport({ chainId, projectId }: { chainId: number; projectId: string }) {
  const RPC_URL = CoreHelperUtil.getBlockchainApiUrl();

  if (!PresetsUtil.RpcChainIds.includes(chainId)) {
    return http();
  }

  return http(`${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chainId}&projectId=${projectId}`);
}
