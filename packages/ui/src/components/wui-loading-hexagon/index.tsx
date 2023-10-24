import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Path, Use } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

const AnimatedUse = Animated.createAnimatedComponent(Use);

export interface LoadingHexagonProps {
  children?: ReactNode;
  paused?: boolean;
}

export function LoadingHexagon({ children, paused }: LoadingHexagonProps) {
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
    outputRange: [0, -172]
  });

  return (
    <View style={styles.container}>
      <Svg width={120} height={120} viewBox="0 0 54 59" style={styles.loader} fill="none">
        <Path
          id="wui-loader-path"
          d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
        />
        <AnimatedUse
          stroke={paused ? 'transparent' : Theme['accent-100']}
          strokeDasharray="54, 118"
          strokeWidth={2}
          strokeDashoffset={spin}
          xlinkHref="#wui-loader-path"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      {children ?? null}
    </View>
  );
}
