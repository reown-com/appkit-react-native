import { useCallback, useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface RouteTransitionConfig {
  duration?: number;
  useNativeDriver?: boolean;
}

export function useRouteTransition(config: RouteTransitionConfig = {}) {
  const { duration = 300, useNativeDriver = true } = config;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const animateTransition = useCallback(
    (direction: 'forward' | 'backward' | 'none') => {
      if (isAnimating.current || direction === 'none') {
        return Promise.resolve();
      }

      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }

      isAnimating.current = true;

      return new Promise<void>(resolve => {
        const startPosition =
          direction === 'forward'
            ? screenWidth * 0.01 // Start from right for forward
            : -screenWidth * 0.01; // Start from left for backward

        // Immediately set starting position and fade out
        fadeAnim.setValue(0);
        slideAnim.setValue(startPosition);

        // Animate to final position with fade in
        const animation = Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver
          }),
          Animated.timing(slideAnim, {
            toValue: 0, // Slide to center
            duration,
            useNativeDriver
          })
        ]);

        currentAnimation.current = animation;

        animation.start(({ finished }) => {
          if (finished) {
            isAnimating.current = false;
            currentAnimation.current = null;
            resolve();
          }
        });
      });
    },
    [fadeAnim, slideAnim, duration, useNativeDriver]
  );

  const getAnimatedStyle = useCallback(
    () => ({
      opacity: fadeAnim,
      transform: [{ translateX: slideAnim }]
    }),
    [fadeAnim, slideAnim]
  );

  useEffect(() => {
    fadeAnim.setValue(1);
    slideAnim.setValue(0);

    return () => {
      // Cleanup: stop any running animations
      if (currentAnimation.current) {
        currentAnimation.current.stop();
        currentAnimation.current = null;
      }
      isAnimating.current = false;
    };
  }, [fadeAnim, slideAnim]);

  return {
    animateTransition,
    getAnimatedStyle,
    isAnimating: isAnimating.current
  };
}
