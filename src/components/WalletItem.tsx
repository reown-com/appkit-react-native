import { Image, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import type { Listing } from '../types/controllerTypes';
import { ExplorerUtil } from '../utils/ExplorerUtil';
import { ConfigCtrl } from '../controllers/ConfigCtrl';
import useTheme from '../hooks/useTheme';
import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import Touchable from './Touchable';

interface Props {
  currentWCURI?: string;
  walletInfo: Listing;
  style?: StyleProp<ViewStyle>;
}

export const ITEM_HEIGHT = 80;

function WalletItem({ currentWCURI, walletInfo, style }: Props) {
  const Theme = useTheme();

  const onPress = () => {
    if (currentWCURI) {
      ConfigCtrl.setRecentWalletDeepLink(
        walletInfo.mobile?.native || walletInfo.mobile?.universal
      );
      ExplorerUtil.navigateDeepLink(
        walletInfo.mobile.universal,
        walletInfo.mobile.native,
        currentWCURI
      );
    }
  };

  return (
    <Touchable
      onPress={onPress}
      key={walletInfo.id}
      style={[styles.container, style]}
    >
      <Image
        style={[styles.icon, { borderColor: Theme.overlayThin }]}
        source={{
          uri: ExplorerCtrl.getWalletImageUrl(walletInfo.image_id),
        }}
      />
      <Text
        style={[styles.name, { color: Theme.foreground1 }]}
        numberOfLines={1}
      >
        {walletInfo.name}
      </Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: 'center',
    marginVertical: 16,
  },
  icon: {
    height: 60,
    width: 60,
    borderRadius: 16,
    borderWidth: 1,
  },
  name: {
    marginTop: 5,
    maxWidth: 100,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WalletItem;
