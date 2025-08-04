import { useRef, useState } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import type { ChipType, ColorType, IconType, SizeType } from '../../utils/TypesUtil';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../../components/wui-text';
import { Image } from '../../components/wui-image';
import { Icon } from '../../components/wui-icon';
import styles, { getThemedChipStyle, getThemedTextColor } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ChipProps {
  label?: string;
  imageSrc?: string;
  leftIcon?: IconType;
  rightIcon?: IconType;
  variant?: ChipType;
  size?: Exclude<SizeType, 'xl' | 'lg' | 'xs' | 'xxs'>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Chip({
  onPress,
  imageSrc,
  leftIcon,
  rightIcon,
  variant = 'fill',
  size = 'md',
  disabled,
  label,
  style
}: ChipProps) {
  const Theme = useTheme();
  const colorAnimation = useRef(new Animated.Value(0));
  const [pressed, setPressed] = useState(false);
  const themedNormalStyle = getThemedChipStyle(Theme, variant, disabled, false);
  const themedPressedStyle = getThemedChipStyle(Theme, variant, disabled, true);
  const themedTextColor = getThemedTextColor(variant, disabled, pressed);
  const iconSize = size === 'md' ? 'sm' : 'xs';

  const handlePress = () => {
    onPress?.();
  };

  const onPressIn = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: false,
      duration: 200
    }).start();
    setPressed(true);
  };

  const onPressOut = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: false,
      duration: 200
    }).start();
    setPressed(false);
  };

  const backgroundColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [themedNormalStyle.backgroundColor, themedPressedStyle.backgroundColor]
  });

  const borderColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [themedNormalStyle.borderColor, themedPressedStyle.borderColor]
  });

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[styles.container, styles[`${size}Chip`], { borderColor, backgroundColor }, style]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={handlePress}
    >
      {imageSrc ? <Image
          style={[
            styles.image,
            styles[`${size}Image`],
            { borderColor: themedNormalStyle.borderColor },
            disabled && styles.disabledImage
          ]}
          source={imageSrc}
        /> : null}
      {leftIcon ? <Icon name={leftIcon} color={themedTextColor as ColorType} /> : null}
      <Text
        variant={size === 'md' ? 'paragraph-600' : 'small-600'}
        style={[styles.link, { color: Theme[themedTextColor] }]}
      >
        {label}
      </Text>
      {rightIcon ? <Icon
          name={rightIcon}
          size={iconSize}
          color={themedTextColor as ColorType}
          style={styles.icon}
        /> : null}
    </AnimatedPressable>
  );
}
