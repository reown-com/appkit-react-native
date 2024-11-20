import { Platform } from 'react-native';
import { CoreHelperUtil } from './CoreHelperUtil';

export const ApiUtil = {
  getOrigin() {
    return CoreHelperUtil.getBundleId();
  },

  getReactNativeVersion() {
    return [
      Platform.constants?.reactNativeVersion?.major,
      Platform.constants?.reactNativeVersion?.minor,
      Platform.constants?.reactNativeVersion?.patch
    ].join('.');
  },

  getUserAgent() {
    const rnVersion = Platform.select({
      ios: this.getReactNativeVersion(),
      android: this.getReactNativeVersion(),
      default: 'undefined'
    });

    return `${Platform.OS}-${Platform.Version}@rn-${rnVersion}`;
  }
};
