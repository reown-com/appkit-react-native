import { Animated, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { WalletImage } from '../wui-wallet-image';
import styles from './styles';

export interface AllWalletsImageProps {
  walletImages?: string[];
  imageHeaders?: Record<string, string>;
  style?: any;
}

export function AllWalletsImage({ walletImages, imageHeaders, style }: AllWalletsImageProps) {
  const Theme = useTheme();
  const _wallets = walletImages?.slice(0, 4) || [];
  const _emptyBoxes = Array.from(Array(4 - _wallets.length).keys());

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: Theme['bg-200'], borderColor: Theme['gray-glass-010'] },
        style
      ]}
    >
      <View style={styles.row}>
        {_wallets.map(wallet => (
          <WalletImage
            key={wallet}
            size="xs"
            imageSrc={wallet}
            imageHeaders={imageHeaders}
            style={styles.icon}
          />
        ))}
        {_emptyBoxes.map((_, i) => (
          <WalletImage key={i} size="xs" style={styles.icon} />
        ))}
      </View>
    </Animated.View>
  );
}
