import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { IconBox } from '../wui-icon-box';

import styles from './styles';
import useAnimatedValue from '../../hooks/useAnimatedValue';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NetworkButtonProps {
  children: string;
  onPress: () => void;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NetworkButton({
  imageSrc,
  imageHeaders,
  disabled,
  onPress,
  style,
  children
}: NetworkButtonProps) {
  const Theme = useTheme();
  const textColor = disabled ? 'fg-300' : 'fg-100';
  const borderColor = disabled ? 'gray-glass-005' : 'gray-glass-010';

  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  const backgroundColor = disabled ? Theme['gray-glass-020'] : animatedValue;

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor, borderColor: Theme[borderColor] }, style]}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      disabled={disabled}
    >
      {imageSrc ? (
        <Image
          style={[
            styles.image,
            { borderColor: Theme[borderColor] },
            disabled && styles.imageDisabled
          ]}
          source={imageSrc}
          headers={imageHeaders}
        />
      ) : (
        <IconBox icon="networkPlaceholder" background iconColor={textColor} size="sm" />
      )}
      <Text style={styles.text} variant="paragraph-600" color={textColor}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}
