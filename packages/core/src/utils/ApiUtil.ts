import { Platform } from 'react-native';
import { CoreHelperUtil } from './CoreHelperUtil';

export const ApiUtil = {
  getOrigin() {
    return CoreHelperUtil.getBundleId() ?? 'react-native-unknown-origin';
  },

  getReactNativeVersion() {
    return [
      Platform.constants?.reactNativeVersion?.major,
      Platform.constants?.reactNativeVersion?.minor,
      Platform.constants?.reactNativeVersion?.patch
    ].join('.');
  },

  getEnvironment() {
    try {
      // Check if Expo is installed
      const hasExpoGlobal = !!(global as any).expo;
      const hasExpoConstants = hasExpoGlobal && (global as any).expo?.modules?.ExponentConstants;
      const environment: string | undefined =
        hasExpoConstants && (global as any).expo?.modules?.ExponentConstants?.executionEnvironment;

      if (environment === 'standalone' || environment === 'storeClient') {
        return 'expo-managed';
      } else if (environment === 'bare') {
        return 'expo-bare';
      }

      return 'bare';
    } catch {
      return 'bare';
    }
  },

  getUserAgent() {
    const rnVersion = Platform.select({
      ios: this.getReactNativeVersion(),
      android: this.getReactNativeVersion(),
      default: 'undefined'
    });

    const envPrefix = this.getEnvironment();

    const userAgent = `${Platform.OS}-${Platform.Version}@rn-${rnVersion}@${envPrefix}`;

    return userAgent;
  }
};
