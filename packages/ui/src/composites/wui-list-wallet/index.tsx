import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { IconType, TagType } from '../../utils/TypesUtil';
import { Tag } from '../wui-tag';
import { WalletImage } from '../wui-wallet-image';
import { Icon } from '../../components/wui-icon';

import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListWalletProps {
  name: string;
  onPress?: () => void;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  showAllWallets?: boolean;
  tagLabel?: string;
  tagVariant?: TagType;
  icon?: IconType;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ListWallet({
  name,
  onPress,
  imageSrc,
  imageHeaders,
  showAllWallets,
  tagLabel,
  tagVariant,
  icon,
  disabled,
  style
}: ListWalletProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  function imageTemplate() {
    return (
      <WalletImage
        style={[styles.image, disabled && styles.imageDisabled]}
        imageSrc={imageSrc}
        imageHeaders={imageHeaders}
        showAllWallets={showAllWallets}
        size="sm"
      />
    );
  }

  function iconTemplate() {
    if (tagLabel && tagVariant) {
      return (
        <Tag variant={tagVariant} disabled={disabled} style={styles.rightIcon}>
          {tagLabel}
        </Tag>
      );
    }

    if (icon) {
      return (
        <Icon
          name={icon}
          color={disabled ? 'fg-300' : 'fg-200'}
          size="sm"
          style={styles.rightIcon}
        />
      );
    }

    return null;
  }

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['gray-glass-010'] : animatedValue },
        style
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
      {iconTemplate()}
    </AnimatedPressable>
  );
}
