import { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps as NativeProps,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Text } from '../../components/wui-text';
import useTheme from '../../hooks/useTheme';
import { ButtonType, SizeType } from '../../utils/TypesUtil';

import styles, { getThemedButtonStyle, getThemedTextStyle } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonProps = NativeProps & {
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
  variant?: ButtonType;
  disabled?: boolean;
  iconLeft?: string;
  iconRight?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  children,
  size = 'md',
  variant = 'fill',
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const Theme = useTheme();
  const themedTextStyle = getThemedTextStyle(Theme, variant, disabled);
  const colorAnimation = useRef(new Animated.Value(0));

  const themedNormalStyle = getThemedButtonStyle(Theme, variant, disabled, false);
  const themedPressedStyle = getThemedButtonStyle(Theme, variant, disabled, true);

  const onPressIn = () => {
    Animated.spring(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: true,
      overshootClamping: true
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: true,
      overshootClamping: true
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
      <Text variant={size === 'md' ? 'paragraph-600' : 'small-600'} style={themedTextStyle}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}
