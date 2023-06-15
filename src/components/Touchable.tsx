import { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function Touchable({
  children,
  onPress,
  style,
  ...props
}: TouchableOpacityProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const styles = StyleSheet.flatten([style]);

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles, { transform: [{ scale }] }]}
      {...props}
    >
      {children}
    </AnimatedTouchable>
  );
}

export default Touchable;
