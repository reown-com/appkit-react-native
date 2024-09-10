import type { Tokens } from '@reown/scaffold-react-native';
import { ConstantsUtil } from './ConstantsUtil';

export const HelpersUtil = {
  getCaipTokens(tokens?: Tokens) {
    if (!tokens) {
      return undefined;
    }

    const caipTokens: Tokens = {};
    Object.entries(tokens).forEach(([id, token]) => {
      caipTokens[`${ConstantsUtil.EIP155}:${id}`] = token;
    });

    return caipTokens;
  }
};
