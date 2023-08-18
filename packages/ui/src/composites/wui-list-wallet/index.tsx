import { Animated, Pressable, View } from 'react-native';
import { Text } from '../../components/wui-text';
import useAnimatedColor from '../../hooks/useAnimatedColor';
import useTheme from '../../hooks/useTheme';
import { TagType } from '../../utils/TypesUtil';
import { Tag } from '../wui-tag';
import { WalletImage } from '../wui-wallet-image';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListWalletProps {
  name: string;
  onPress?: () => void;
  imageSrc?: string;
  walletImages?: string[];
  tagLabel?: string;
  tagVariant?: TagType;
  disabled?: boolean;
}

export function ListWallet({
  name,
  onPress,
  imageSrc,
  walletImages,
  tagLabel,
  tagVariant,
  disabled
}: ListWalletProps) {
  const Theme = useTheme();
  const { animatedColor, setStartColor, setEndColor } = useAnimatedColor(
    Theme['overlay-002'],
    Theme['overlay-010']
  );

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['overlay-010'] : animatedColor }
      ]}
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndColor}
      onPressOut={setStartColor}
    >
      <View style={styles.leftSide}>
        {walletImages ? null : (
          <WalletImage
            style={[styles.image, disabled && styles.imageDisabled]}
            imageSrc={imageSrc}
            size="sm"
          />
        )}
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
