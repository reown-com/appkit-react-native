import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

function useAnimatedValue<T extends string | number>(
  startValue: T,
  endValue: T,
  duration?: number
) {
  const valueRef = useRef(new Animated.Value(0));

  const setStartValue = useCallback(() => {
    Animated.timing(valueRef.current, {
      toValue: 0,
      useNativeDriver: false,
      duration: duration || 200
    }).start();
  }, [valueRef, duration]);

  const setEndValue = useCallback(() => {
    Animated.timing(valueRef.current, {
      toValue: 1,
      useNativeDriver: false,
      duration: duration || 200
    }).start();
  }, [valueRef, duration]);

  const animatedValue = valueRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: [startValue, endValue] as number[] | string[]
  });

  return { animatedValue, valueRef, setStartValue, setEndValue };
}

export default useAnimatedValue;
