import type { Tokens } from '@reown/appkit-core-react-native';
import { ConstantsUtil } from './ConstantsUtil';
import type { CaipNetworkId } from '@reown/appkit-common-react-native';

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
  },

  isLowerCaseMatch(str1?: string, str2?: string) {
    return str1?.toLowerCase() === str2?.toLowerCase();
  }
};
