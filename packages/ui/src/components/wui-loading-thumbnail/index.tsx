import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import useTheme from '../../hooks/useTheme';
import styles from './styles';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface LoadingThumbnailProps {
  children?: ReactNode;
  showError?: boolean;
}

export function LoadingThumbnail({ children, showError }: LoadingThumbnailProps) {
  const Theme = useTheme();
  const spinValue = useRef(new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(spinValue.current, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.linear
    });

    const loop = Animated.loop(animation);
    loop.start();

    return () => {
      loop.stop();
    };
  }, [spinValue]);

  const spin = spinValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -360]
  });

  return (
    <View style={styles.container}>
      <Svg width={110} height={110} viewBox="0 0 110 110" style={styles.loader}>
        <AnimatedRect
          x="2"
          y="2"
          width={106}
          height={106}
          rx={36}
          stroke={showError ? 'transparent' : Theme['blue-100']}
          strokeWidth={4}
          fill="transparent"
          strokeDasharray={'116 245'}
          strokeDashoffset={spin}
        />
      </Svg>
      {showError && (
        <View
          style={[
            styles.error,
            {
              borderColor: Theme['error-100']
            }
          ]}
        />
      )}
      {children ?? null}
    </View>
  );
}
