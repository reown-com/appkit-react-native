import { useRef } from 'react';
import { Animated, Image as NativeImage, type ImageProps as NativeProps } from 'react-native';
import styles from './styles';

const AnimatedImage = Animated.createAnimatedComponent(NativeImage);

export type ImageProps = Omit<NativeProps, 'source'> & {
  source: string;
  headers?: Record<string, string>;
};

export function Image({ source, headers, style, ...rest }: ImageProps) {
  const opacity = useRef(new Animated.Value(0));

  const onLoadEnd = () => {
    Animated.timing(opacity.current, {
      toValue: 1,
      useNativeDriver: true,
      duration: 150
    }).start();
  };

  return (
    <AnimatedImage
      onLoadEnd={onLoadEnd}
      source={{ uri: source, headers }}
      style={[styles.image, { opacity: opacity.current }, style]}
      {...rest}
    />
  );
}
