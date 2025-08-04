import type { CaipAddress } from '../types';

export const NetworkUtil = {
  caipNetworkIdToNumber(caipnetworkId?: `${string}:${string}`) {
    return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined;
  },
  getPlainAddress(caipAddress?: CaipAddress) {
    return caipAddress?.split(':')[2];
  }
};
