import { Linking } from 'react-native';
import { Alert } from 'react-native';
import type { ListingResponse, PageParams } from '../types/controllerTypes';
import { CoreUtil } from './CoreUtil';

const EXPLORER_API = 'https://explorer-api.walletconnect.com';

function formatParams(params: PageParams) {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(
        ([_, value]) =>
          typeof value !== 'undefined' && value !== null && value !== ''
      )
      .map(([key, value]) => [key, value.toString()])
  );

  return new URLSearchParams(stringParams).toString();
}

export const ExplorerUtil = {
  async fetchWallets(
    projectId: string,
    params?: PageParams
  ): Promise<ListingResponse> {
    let fetchUrl = `${EXPLORER_API}/v3/wallets?projectId=${projectId}&sdks=sign_v2`;
    if (params) {
      const urlParams = formatParams(params);
      fetchUrl = `${fetchUrl}&${urlParams}`;
    }
    const fetched = await fetch(fetchUrl);

    //TODO: Add installed boolean & catch errors
    return fetched.json();
  },

  formatImageUrl(projectId: string, imageId: string) {
    return `${EXPLORER_API}/v3/logo/lg/${imageId}?projectId=${projectId}`;
  },

  async navigateDeepLink(
    universalLink: string,
    deepLink: string,
    wcURI: string
  ) {
    let tempDeepLink;

    if (universalLink && universalLink !== '') {
      tempDeepLink = CoreUtil.formatUniversalUrl(universalLink, wcURI);
    } else if (deepLink && deepLink !== '') {
      tempDeepLink = CoreUtil.formatNativeUrl(deepLink, wcURI);
    } else {
      Alert.alert('No valid link found for this wallet');
      return;
    }

    try {
      // Note: Could not use .canOpenURL() to check if the app is installed
      // Due to having to add it to the iOS info.plist
      await Linking.openURL(tempDeepLink);
    } catch (error) {
      Alert.alert(`Unable to open this DeepLink: ${tempDeepLink}`);
    }
  },
};
