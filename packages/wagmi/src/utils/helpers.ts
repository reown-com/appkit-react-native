import type { CaipNetwork } from '@web3modal/scaffold-react-native';
import { PresetsUtil, ConstantsUtil } from '@web3modal/scaffold-utils-react-native';
import type { Web3ModalClientOptions } from '../client';

export function getCaipDefaultChain(chain?: Web3ModalClientOptions['defaultChain']) {
  if (!chain) {
    return undefined;
  }

  return {
    id: `${ConstantsUtil.EIP155}:${chain.id}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.id]
  } as CaipNetwork;
}
