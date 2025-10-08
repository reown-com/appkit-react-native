import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, Spacing, WalletImageSize } from '../../utils/ThemeUtil';
import styles from './styles';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export interface LoadingThumbnailProps {
  children?: ReactNode;
  paused?: boolean;
  borderRadius?: number;
}

export function LoadingThumbnail({
  children,
  paused,
  borderRadius = BorderRadius.l
}: LoadingThumbnailProps) {
  const Theme = useTheme();
  const spinValue = useRef(new Animated.Value(0));
  const strokeWidth = 4;
  const rectangleSize = WalletImageSize.xl + Spacing.l;
  const outerContainerSize = rectangleSize + strokeWidth;

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
  }, []);

  const { sideLength, strokeColor, containerStyle } = useMemo(() => {
    const _sideLength = rectangleSize - borderRadius * 2 + (Math.PI * borderRadius) / 2;
    const _strokeColor = paused ? 'transparent' : Theme['accent-100'];
    const _containerStyle = { height: outerContainerSize, width: outerContainerSize };

    return { sideLength: _sideLength, strokeColor: _strokeColor, containerStyle: _containerStyle };
  }, [rectangleSize, borderRadius, paused, Theme, outerContainerSize]);

  const spin = useMemo(() => {
    return spinValue.current.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -sideLength * 4]
    });
  }, [sideLength]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Svg width={outerContainerSize} height={outerContainerSize} style={styles.loader}>
        <AnimatedRect
          height={rectangleSize}
          width={rectangleSize}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          rx={borderRadius}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${sideLength} ${sideLength * 3}`}
          strokeDashoffset={spin}
        />
      </Svg>
      {children ?? null}
    </View>
  );
}
