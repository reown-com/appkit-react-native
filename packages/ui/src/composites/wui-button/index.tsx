import { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps as NativeProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Text } from '../../components/wui-text';
import { Icon } from '../../components/wui-icon';
import { useTheme } from '../../hooks/useTheme';
import type { ButtonType, IconType, SizeType } from '../../utils/TypesUtil';

import styles, { getThemedButtonStyle, getThemedTextStyle } from './styles';
import type { SvgProps } from 'react-native-svg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonProps = NativeProps & {
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
  variant?: Exclude<ButtonType, 'shade'>;
  disabled?: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  iconStyle?: SvgProps['style'];
};

export function Button({
  children,
  size = 'md',
  variant = 'fill',
  disabled,
  onPress,
  style,
  iconLeft,
  iconRight,
  iconStyle,
  ...rest
}: ButtonProps) {
  const Theme = useTheme();
  const themedTextStyle = getThemedTextStyle(Theme, variant, disabled);
  const colorAnimation = useRef(new Animated.Value(0));
  const iconColor = variant === 'fill' ? 'inverse-100' : 'blue-100';

  const themedNormalStyle = getThemedButtonStyle(Theme, variant, disabled, false);
  const themedPressedStyle = getThemedButtonStyle(Theme, variant, disabled, true);

  const onPressIn = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: true,
      duration: 200
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200
    }).start();
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
      style={[styles.button, styles[`${size}Button`], { backgroundColor, borderColor }, style]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      {...rest}
    >
      {iconLeft && (
        <Icon color={iconColor} name={iconLeft} size={size} style={[styles.iconLeft, iconStyle]} />
      )}
      <Text variant={size === 'md' ? 'paragraph-600' : 'small-600'} style={themedTextStyle}>
        {children}
      </Text>
      {iconRight && (
        <Icon color={iconColor} name={iconRight} size={size} style={styles.iconRight} />
      )}
    </AnimatedPressable>
  );
}
