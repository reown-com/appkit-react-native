import { Alert, Linking } from 'react-native';
import type { ListingParams, ListingResponse } from '../types/controllerTypes';
import { CoreUtil } from './CoreUtil';
import { ConfigCtrl } from '../controllers/ConfigCtrl';

// -- Helpers -------------------------------------------------------
const W3M_API = 'https://explorer-api.walletconnect.com';

async function fetchListings(
  endpoint: string,
  params: ListingParams
): Promise<ListingResponse> {
  const url = new URL(endpoint, W3M_API);
  url.searchParams.append('projectId', ConfigCtrl.state.projectId);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const request = await fetch(url.toString());

  return request.json() as Promise<ListingResponse>;
}

// -- Utility -------------------------------------------------------
export const ExplorerUtil = {
  async getMobileListings(params: ListingParams) {
    return fetchListings('/w3m/v1/getMobileListings', params);
  },

  getWalletImageUrl(imageId: string) {
    return `${W3M_API}/w3m/v1/getWalletImage/${imageId}?projectId=${ConfigCtrl.state.projectId}`;
  },

  getAssetImageUrl(imageId: string) {
    return `${W3M_API}/w3m/v1/getAssetImage/${imageId}?projectId=${ConfigCtrl.state.projectId}`;
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
      await Linking.openURL(tempDeepLink);
    } catch (error) {
      Alert.alert(`Unable to open this DeepLink: ${tempDeepLink}`);
    }
  },
};
