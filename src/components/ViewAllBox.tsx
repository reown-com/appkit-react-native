import {
  Image,
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { ExplorerCtrl } from '../controllers/ExplorerCtrl';
import useTheme from '../hooks/useTheme';
import type { Listing } from '../types/controllerTypes';
import Touchable from './Touchable';

interface Props {
  onPress: any;
  wallets: Listing[];
  style?: StyleProp<ViewStyle>;
}

function ViewAllBox({ onPress, wallets, style }: Props) {
  const Theme = useTheme();

  return (
    <Touchable onPress={onPress} style={[styles.container, style]}>
      <View style={[styles.icons, { borderColor: Theme.overlayThin }]}>
        <View style={styles.row}>
          {wallets.slice(0, 2).map((wallet) => (
            <Image
              key={wallet.id}
              source={{ uri: ExplorerCtrl.getWalletImageUrl(wallet.image_id) }}
              style={[styles.icon, { borderColor: Theme.overlayThin }]}
            />
          ))}
        </View>
        <View style={styles.row}>
          {wallets.slice(2, 4).map((wallet) => (
            <Image
              key={wallet.id}
              source={{ uri: ExplorerCtrl.getWalletImageUrl(wallet.image_id) }}
              style={[styles.icon, { borderColor: Theme.overlayThin }]}
            />
          ))}
        </View>
      </View>
      <View>
        <Text
          style={[styles.text, { color: Theme.foreground1 }]}
          numberOfLines={1}
        >
          View All
        </Text>
      </View>
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
  icons: {
    height: 60,
    width: 60,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    height: 23,
    width: 23,
    borderRadius: 8,
    margin: 1,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
  text: {
    marginTop: 5,
    maxWidth: 100,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ViewAllBox;
