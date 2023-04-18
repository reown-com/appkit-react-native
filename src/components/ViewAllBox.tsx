import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { DarkTheme, LightTheme } from '../constants/Colors';
import type { Listing } from '../types/controllerTypes';
import { ExplorerUtil } from '../utils/ExplorerUtil';

interface Props {
  onPress: any;
  wallets: Listing[];
  isDarkMode: boolean;
  style?: StyleProp<ViewStyle>;
}

const WalletIcon = ({ wallet }: { wallet: Listing }) => (
  <Image
    source={{ uri: ExplorerUtil.getWalletImageUrl(wallet.image_id) }}
    style={styles.icon}
  />
);

function ViewAllBox({ onPress, wallets, style, isDarkMode }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <View style={[styles.icons, isDarkMode && styles.iconsDark]}>
        <View style={styles.row}>
          {wallets.slice(0, 2).map((wallet) => (
            <WalletIcon key={wallet.id} wallet={wallet} />
          ))}
        </View>
        <View style={styles.row}>
          {wallets.slice(2, 4).map((wallet) => (
            <WalletIcon key={wallet.id} wallet={wallet} />
          ))}
        </View>
      </View>
      <View>
        <Text
          style={[styles.text, isDarkMode && styles.textDark]}
          numberOfLines={1}
        >
          View All
        </Text>
      </View>
    </TouchableOpacity>
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
    borderColor: LightTheme.overlayThin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsDark: {
    backgroundColor: DarkTheme.background2,
  },
  icon: {
    height: 23,
    width: 23,
    borderRadius: 8,
    margin: 1,
    borderWidth: 1,
    borderColor: LightTheme.overlayThin,
  },
  row: {
    flexDirection: 'row',
  },
  text: {
    color: LightTheme.foreground1,
    marginTop: 5,
    maxWidth: 100,
    fontWeight: '600',
    fontSize: 12,
  },
  textDark: {
    color: DarkTheme.foreground1,
  },
});

export default ViewAllBox;
