import type { Tokens } from '@reown/appkit-scaffold-react-native';
import type { CaipNetworkId } from '@reown/appkit-common-react-native';
import { ConstantsUtil } from './ConstantsUtil';

export const HelpersUtil = {
  getCaipTokens(tokens?: Tokens) {
    if (!tokens) {
      return undefined;
    }

    const caipTokens: Tokens = {};
    Object.entries(tokens).forEach(([id, token]) => {
      caipTokens[`${ConstantsUtil.EIP155}:${id}` as CaipNetworkId] = token;
    });

    return caipTokens;
  }
};
