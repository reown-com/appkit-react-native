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
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import { useTheme } from '../../hooks/useTheme';
import type { ButtonType, IconType, SizeType } from '../../utils/TypesUtil';

import styles, { getThemedButtonStyle, getThemedTextStyle, getIconColor } from './styles';
import type { SvgProps } from 'react-native-svg';
import { FlexView } from '../../layout/wui-flex';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonProps = NativeProps & {
  size?: Exclude<SizeType, 'xl' | 'lg' | 'xs' | 'xxs'>;
  variant?: ButtonType;
  disabled?: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  iconStyle?: SvgProps['style'];
  loading?: boolean;
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
  loading,
  ...rest
}: ButtonProps) {
  const Theme = useTheme();
  const themedTextStyle = getThemedTextStyle(Theme, variant, disabled);
  const colorAnimation = useRef(new Animated.Value(0));
  const iconSize = size === 'md' ? 'sm' : 'xs';
  const iconColor = getIconColor(variant, disabled);
  const themedNormalStyle = getThemedButtonStyle(Theme, variant, disabled, false);
  const themedPressedStyle = getThemedButtonStyle(Theme, variant, disabled, true);

  const onPressIn = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: false,
      duration: 200
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: false,
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
      disabled={disabled || loading}
      style={[styles.button, styles[`${size}Button`], { backgroundColor, borderColor }, style]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      {...rest}
    >
      <FlexView flexDirection="row" alignItems="center" justifyContent="center">
        {iconLeft && (
          <Icon
            color={iconColor}
            name={iconLeft}
            size={iconSize}
            style={[styles.iconLeft, iconStyle]}
          />
        )}
        {loading && <LoadingSpinner color={iconColor} />}
        {!loading &&
          (typeof children === 'string' ? (
            <Text
              variant={size === 'md' ? 'paragraph-600' : 'small-600'}
              style={[styles.text, themedTextStyle]}
            >
              {children}
            </Text>
          ) : (
            children
          ))}
        {iconRight && (
          <Icon
            color={iconColor}
            name={iconRight}
            size={iconSize}
            style={[styles.iconRight, iconStyle]}
          />
        )}
      </FlexView>
    </AnimatedPressable>
  );
}
