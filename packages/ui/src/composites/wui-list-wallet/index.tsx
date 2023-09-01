import { Animated, Pressable, View } from 'react-native';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import useTheme from '../../hooks/useTheme';
import type { TagType } from '../../utils/TypesUtil';
import { Tag } from '../wui-tag';
import { WalletImage } from '../wui-wallet-image';
import { AllWalletsImage } from '../wui-all-wallets-image';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListWalletProps {
  name: string;
  onPress?: () => void;
  imageSrc?: string;
  walletImages?: string[];
  showAllWallets?: boolean;
  tagLabel?: string;
  tagVariant?: TagType;
  disabled?: boolean;
}

export function ListWallet({
  name,
  onPress,
  imageSrc,
  walletImages,
  showAllWallets = false,
  tagLabel,
  tagVariant,
  disabled
}: ListWalletProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['overlay-002'],
    Theme['overlay-010']
  );

  function imageTemplate() {
    if (walletImages && showAllWallets) {
      return (
        <AllWalletsImage
          walletImages={walletImages}
          style={[
            styles.image,
            { backgroundColor: animatedValue },
            disabled && styles.imageDisabled
          ]}
        />
      );
    }

    return (
      <WalletImage
        style={[styles.image, disabled && styles.imageDisabled]}
        imageSrc={imageSrc}
        size="sm"
      />
    );
  }

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['overlay-010'] : animatedValue }
      ]}
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
    >
      <View style={styles.leftSide}>
        {imageTemplate()}
        <Text variant="paragraph-500" style={styles.name} color={disabled ? 'fg-300' : 'fg-100'}>
          {name}
        </Text>
      </View>
      {tagLabel && tagVariant && (
        <Tag variant={tagVariant} disabled={disabled} style={styles.tag}>
          {tagLabel}
        </Tag>
      )}
    </AnimatedPressable>
  );
}
