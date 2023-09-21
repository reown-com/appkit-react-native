import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import useTheme from '../../hooks/useTheme';
import { WalletImage } from '../wui-wallet-image';
import styles from './styles';
import { Icon } from '../../components/wui-icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface StoreEntryProps {
  label: string;
  onPress?: () => void;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StoreEntry({
  label,
  onPress,
  imageSrc,
  imageHeaders,
  disabled,
  style
}: StoreEntryProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['overlay-002'],
    Theme['overlay-010']
  );

  function imageTemplate() {
    return (
      <WalletImage
        style={[styles.image, disabled && styles.imageDisabled]}
        imageSrc={imageSrc}
        imageHeaders={imageHeaders}
        size="sm"
      />
    );
  }

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['overlay-010'] : animatedValue },
        style
      ]}
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
    >
      <View style={styles.leftSide}>
        {imageTemplate()}
        <Text variant="paragraph-500" style={styles.label} color={disabled ? 'fg-300' : 'fg-100'}>
          {label}
        </Text>
      </View>
      <Icon
        name="chevronRight"
        size="sm"
        style={styles.chevron}
        color={disabled ? 'fg-300' : 'fg-100'}
      />
    </AnimatedPressable>
  );
}
