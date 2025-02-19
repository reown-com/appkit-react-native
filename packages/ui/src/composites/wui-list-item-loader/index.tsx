import type { StyleProp, ViewStyle } from 'react-native';
import { BorderRadius, WalletImageSize } from '../../utils/ThemeUtil';
import { useTheme } from '../../hooks/useTheme';
import { Shimmer } from '../../components/wui-shimmer';
import { FlexView } from '../../layout/wui-flex';
import styles from './styles';

export interface ListItemLoaderProps {
  style?: StyleProp<ViewStyle>;
}

export function ListItemLoader({ style }: ListItemLoaderProps) {
  const Theme = useTheme();

  return (
    <FlexView
      alignItems="center"
      flexDirection="row"
      style={[styles.container, { backgroundColor: Theme['gray-glass-002'] }, style]}
    >
      <Shimmer
        height={WalletImageSize.sm}
        width={WalletImageSize.sm}
        borderRadius={BorderRadius.xxs}
      />
      <Shimmer height={22} width={80} borderRadius={6} style={styles.text} />
    </FlexView>
  );
}
