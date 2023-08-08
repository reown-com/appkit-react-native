import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import useTheme from '../../hooks/useTheme';
import styles from './styles';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export function LoadingSpinner() {
  const Theme = useTheme();
  const spinValue = useRef(new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(spinValue.current, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.linear)
    });

    const loop = Animated.loop(animation);
    loop.start();

    return () => {
      loop.stop();
    };
  }, [spinValue]);

  const spin = spinValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <AnimatedSvg
        width={25}
        height={25}
        viewBox="25 25 50 50"
        style={[styles.loader, { transform: [{ rotate: spin }] }]}
      >
        <Circle
          r={20}
          cy={50}
          cx={50}
          stroke={Theme['blue-100']}
          strokeWidth={4}
          fill="transparent"
          strokeDasharray={`90 124`}
        />
      </AnimatedSvg>
    </View>
  );
}
