import { useRef } from 'react';
import {
  Animated,
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType } from '../../utils/TypesUtil';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export interface PressableProps extends RNPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: ColorType | 'transparent';
  pressedBackgroundColor?: ColorType;
  bounceScale?: number;
  animationDuration?: number;
  disabled?: boolean;
  pressable?: boolean;
}

export function Pressable({
  children,
  style,
  disabled = false,
  pressable = true,
  onPress,
  backgroundColor = 'gray-glass-002',
  pressedBackgroundColor = 'gray-glass-010',
  bounceScale = 0.99, // Scale to 99% of original size
  animationDuration = 200, // 200ms animation
  ...rest
}: PressableProps) {
  const Theme = useTheme();
  const pressAnimation = useRef(new Animated.Value(0));
  const scaleAnimation = useRef(new Animated.Value(1));

  const onPressIn = () => {
    Animated.parallel([
      Animated.timing(pressAnimation.current, {
        toValue: 1,
        useNativeDriver: false,
        duration: animationDuration
      }),

      Animated.timing(scaleAnimation.current, {
        toValue: bounceScale,
        useNativeDriver: false,
        duration: animationDuration
      })
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.timing(pressAnimation.current, {
        toValue: 0,
        useNativeDriver: false,
        duration: animationDuration
      }),
      Animated.timing(scaleAnimation.current, {
        toValue: 1,
        useNativeDriver: false,
        duration: animationDuration
      })
    ]).start();
  };

  const bgColor = pressAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [
      Theme[backgroundColor as ColorType] ?? 'transparent',
      Theme[pressedBackgroundColor as ColorType] ?? 'transparent'
    ]
  });

  return (
    <AnimatedPressable
      disabled={disabled || !pressable}
      style={[{ backgroundColor: bgColor, transform: [{ scale: scaleAnimation.current }] }, style]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
