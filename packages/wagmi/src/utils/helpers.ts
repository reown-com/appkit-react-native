import type { CaipNetwork, CaipNetworkId, Tokens } from '@web3modal/scaffold-react-native';
import type { Web3ModalClientOptions } from '../client';
import { NAMESPACE } from './constants';
import { NetworkImageIds } from './presets';

export function getCaipDefaultChain(chain?: Web3ModalClientOptions['defaultChain']) {
  if (!chain) {
    return undefined;
  }

  return {
    id: `${NAMESPACE}:${chain.id}`,
    name: chain.name,
    imageId: NetworkImageIds[chain.id]
  } as CaipNetwork;
}

export function getCaipTokens(tokens?: Web3ModalClientOptions['tokens']) {
  if (!tokens) {
    return undefined;
  }

  const caipTokens: Tokens = {};
  Object.entries(tokens).forEach(([id, token]) => {
    caipTokens[`${NAMESPACE}:${id}`] = token;
  });

  return caipTokens;
}

export function caipNetworkIdToNumber(caipnetworkId?: CaipNetworkId) {
  return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined;
}
