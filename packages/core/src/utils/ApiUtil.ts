import { Platform } from 'react-native';
import { CoreHelperUtil } from './CoreHelperUtil';

export const ApiUtil = {
  getOrigin() {
    return CoreHelperUtil.getBundleId();
  },

  getUserAgent() {
    const reactNativeVersion = [
      Platform.constants.reactNativeVersion.major,
      Platform.constants.reactNativeVersion.minor,
      Platform.constants.reactNativeVersion.patch
    ].join('.');

    return `${Platform.OS}-${Platform.Version}@rn-${reactNativeVersion}`;
  }
};
