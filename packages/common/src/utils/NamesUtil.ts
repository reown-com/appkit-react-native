import { ConstantsUtil } from './ConstantsUtil';

export const NamesUtil = {
  isReownName(value: string) {
    return (
      value?.endsWith(ConstantsUtil.WC_NAME_SUFFIX_LEGACY) ||
      value?.endsWith(ConstantsUtil.WC_NAME_SUFFIX)
    );
  }
};
