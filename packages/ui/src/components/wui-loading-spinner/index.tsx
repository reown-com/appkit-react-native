import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { SpinnerSize } from '../../utils/ThemeUtil';
import type { ColorType, SizeType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export interface LoadingSpinnerProps {
  size?: Exclude<SizeType, 'xs' | 'xxs'>;
  color?: Exclude<ColorType, 'error-100' | 'fg-300' | 'success-100'>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingSpinner({
  color,
  style,
  size = 'lg',
  testID = 'loading-spinner'
}: LoadingSpinnerProps) {
  const Theme = useTheme();
  const spinValue = useRef(new Animated.Value(0));
  const stroke = color ? Theme[color] : Theme['accent-100'];

  useEffect(() => {
    const animation = Animated.timing(spinValue.current, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.linear
    });

    const loop = Animated.loop(animation);
    loop.start();

    return () => {
      loop.stop();
    };
  }, []);

  const spin = useMemo(() => {
    return spinValue.current.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
  }, []);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <AnimatedSvg
        width={SpinnerSize[size]}
        height={SpinnerSize[size]}
        viewBox="25 25 50 50"
        style={{ transform: [{ rotate: spin }] }}
      >
        <Circle
          r={20}
          cy={50}
          cx={50}
          stroke={stroke}
          strokeWidth={4}
          fill="transparent"
          strokeDasharray={`90 124`}
        />
      </AnimatedSvg>
    </View>
  );
}
