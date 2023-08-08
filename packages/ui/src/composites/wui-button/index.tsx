import { useRef, useState } from 'react';
import { Animated, Pressable, PressableProps as NativeProps } from 'react-native';
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
};

export function Button({
  children,
  size = 'md',
  variant = 'fill',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const Theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const themedButtonStyle = getThemedButtonStyle(Theme, variant, disabled, pressed);
  const themedTextStyle = getThemedTextStyle(Theme, variant, disabled);

  const onPressIn = () => {
    setPressed(true);
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const onPressOut = () => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[
        styles.button,
        styles[`${size}Button`],
        { transform: [{ scale }] },
        themedButtonStyle,
        style
      ]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      {...rest}
    >
      <Text variant={size === 'md' ? 'paragraph-600' : 'small-600'} style={themedTextStyle}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}
