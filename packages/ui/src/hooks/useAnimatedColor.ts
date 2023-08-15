import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

function useAnimatedColor(startColor: string, endColor: string) {
  const colorAnimation = useRef(new Animated.Value(0));

  const setStartColor = useCallback(() => {
    Animated.spring(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: true,
      overshootClamping: true
    }).start();
  }, [colorAnimation]);

  const setEndColor = useCallback(() => {
    Animated.spring(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: true,
      overshootClamping: true
    }).start();
  }, [colorAnimation]);

  const animatedColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [startColor, endColor]
  });

  return { animatedColor, setStartColor, setEndColor };
}

export default useAnimatedColor;
