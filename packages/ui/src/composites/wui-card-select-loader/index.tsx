import { type StyleProp, type ViewStyle } from 'react-native';
import { BorderRadius, Spacing, WalletImageSize } from '../../utils/ThemeUtil';
import { useTheme } from '../../hooks/useTheme';
import { Shimmer } from '../../components/wui-shimmer';
import { FlexView } from '../../layout/wui-flex';
import styles, { ITEM_HEIGHT } from './styles';

export const CardSelectLoaderHeight = ITEM_HEIGHT;

export interface CardSelectLoaderProps {
  style?: StyleProp<ViewStyle>;
}

export function CardSelectLoader({ style }: CardSelectLoaderProps) {
  const Theme = useTheme();

  return (
    <FlexView
      alignItems="center"
      justifyContent="center"
      style={[styles.container, { backgroundColor: Theme['gray-glass-002'] }, style]}
    >
      <Shimmer
        height={WalletImageSize.md}
        width={WalletImageSize.md}
        borderRadius={BorderRadius.xs}
      />
      <Shimmer
        height={14}
        width={WalletImageSize.md - Spacing.xs}
        borderRadius={6}
        style={styles.text}
      />
    </FlexView>
  );
}
