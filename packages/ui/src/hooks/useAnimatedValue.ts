import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

function useAnimatedValue(startValue: string, endValue: string) {
  const valueRef = useRef(new Animated.Value(0));

  const setStartValue = useCallback(() => {
    Animated.timing(valueRef.current, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200
    }).start();
  }, [valueRef]);

  const setEndValue = useCallback(() => {
    Animated.timing(valueRef.current, {
      toValue: 1,
      useNativeDriver: true,
      duration: 200
    }).start();
  }, [valueRef]);

  const animatedValue = valueRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: [startValue, endValue]
  });

  return { animatedValue, setStartValue, setEndValue };
}

export default useAnimatedValue;
