import React, { useRef, useState, useCallback } from 'react';
import { Animated, type LayoutChangeEvent, View, type ViewStyle, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
};

export const AnimatedModalContent = ({ children, containerStyle }: Props) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [isInitialMeasurement, setIsInitialMeasurement] = useState(true);
  const contentHeightRef = useRef(0);
  const animationInProgressRef = useRef(false);

  console.log('[Debug] isInitialMeasurement:', isInitialMeasurement);
  console.log('[Debug] contentHeightRef:', contentHeightRef.current);
  console.log('[Debug] animatedHeight:', animatedHeight);

  const onContentLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const newHeight = Math.round(event.nativeEvent.layout.height);

      contentHeightRef.current = newHeight;

      if (isInitialMeasurement) {
        console.log('[Debug] Setting initial height:', newHeight);
        animatedHeight.setValue(newHeight);
        setIsInitialMeasurement(false);

        return;
      }

      animationInProgressRef.current = true;
      Animated.spring(animatedHeight, {
        toValue: newHeight,
        useNativeDriver: false,
        tension: 180,
        friction: 16
      }).start(() => {
        animationInProgressRef.current = false;
      });
    },
    [animatedHeight, isInitialMeasurement]
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: animatedHeight
        },
        containerStyle
      ]}
    >
      <View style={styles.measureContainer} onLayout={onContentLayout}>
        {children}
      </View>
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative'
  },
  measureContainer: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    right: 0
  },
  content: {
    flex: 1
  }
});
