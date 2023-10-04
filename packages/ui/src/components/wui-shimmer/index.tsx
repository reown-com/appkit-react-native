import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';
import { WalletImageSize } from '../../utils/ThemeUtil';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export interface ShimmerProps {
  size?: Exclude<SizeType, 'xxs'>;
}

export const Shimmer = ({ size = 'md' }: ShimmerProps) => {
  const Theme = useTheme();
  const translationX = useRef(new Animated.Value(0)).current;
  const width = WalletImageSize[size];

  useEffect(() => {
    const animation = Animated.timing(translationX, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true
    });

    Animated.loop(animation).start();
  }, [translationX, width]);

  const animatedPosition: Animated.AnimatedInterpolation<number> = translationX.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100]
  });

  const animatedPosition2: Animated.AnimatedInterpolation<number> = translationX.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 150]
  });

  return (
    <AnimatedSvg width={width} height={width} viewBox="0 0 56 56" fill="none">
      <Path
        d="M0 23.24C0 14.6053 0 10.288 1.83916 7.06358C3.0814 4.8857 4.8857 3.0814 7.06358 1.83916C10.288 0 14.6053 0 23.24 0H32.76C41.3947 0 45.712 0 48.9364 1.83916C51.1143 3.0814 52.9186 4.8857 54.1608 7.06358C56 10.288 56 14.6053 56 23.24V32.76C56 41.3947 56 45.712 54.1608 48.9364C52.9186 51.1143 51.1143 52.9186 48.9364 54.1608C45.712 56 41.3947 56 32.76 56H23.24C14.6053 56 10.288 56 7.06358 54.1608C4.8857 52.9186 3.0814 51.1143 1.83916 48.9364C0 45.712 0 41.3947 0 32.76V23.24Z"
        fill="url(#paint0_linear_10271_10479)"
      />
      <Path
        d="M0.5 23.24C0.5 18.9136 0.50047 15.7018 0.727894 13.1676C0.95471 10.6402 1.40418 8.83534 2.27347 7.31131C3.47135 5.21122 5.21122 3.47135 7.31131 2.27347C8.83534 1.40418 10.6402 0.95471 13.1676 0.727894C15.7018 0.50047 18.9136 0.5 23.24 0.5H32.76C37.0864 0.5 40.2982 0.50047 42.8324 0.727894C45.3598 0.95471 47.1647 1.40418 48.6887 2.27347C50.7888 3.47135 52.5287 5.21122 53.7265 7.31131C54.5958 8.83534 55.0453 10.6402 55.2721 13.1676C55.4995 15.7018 55.5 18.9136 55.5 23.24V32.76C55.5 37.0864 55.4995 40.2982 55.2721 42.8324C55.0453 45.3598 54.5958 47.1647 53.7265 48.6887C52.5287 50.7888 50.7888 52.5287 48.6887 53.7265C47.1647 54.5958 45.3598 55.0453 42.8324 55.2721C40.2982 55.4995 37.0864 55.5 32.76 55.5H23.24C18.9136 55.5 15.7018 55.4995 13.1676 55.2721C10.6402 55.0453 8.83534 54.5958 7.31131 53.7265C5.21122 52.5287 3.47135 50.7888 2.27347 48.6887C1.40418 47.1647 0.95471 45.3598 0.727894 42.8324C0.50047 40.2982 0.5 37.0864 0.5 32.76V23.24Z"
        stroke={Theme['overlay-005']}
      />
      <Defs>
        <AnimatedGradient
          id="paint0_linear_10271_10479"
          x1={animatedPosition2}
          y1="37.3333"
          x2={animatedPosition}
          y2="18.6667"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.448372} stopColor={Theme['bg-200']} />
          <Stop offset={0.517333} stopColor={Theme['bg-300']} />
          <Stop offset={0.789249} stopColor={Theme['bg-200']} />
        </AnimatedGradient>
      </Defs>
    </AnimatedSvg>
  );
};
