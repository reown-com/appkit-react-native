import { useRef } from 'react';
import {
  Animated,
  Image as NativeImage,
  type ImageProps as NativeProps,
  Platform
} from 'react-native';
import styles from './styles';

export type ImageProps = Omit<NativeProps, 'source'> & {
  source: string;
  headers?: Record<string, string>;
};

export function Image({ source, headers, style, ...rest }: ImageProps) {
  const opacity = useRef(new Animated.Value(0));
  const isIos = Platform.OS === 'ios';

  // Fade in image on load for iOS. Android does this by default.
  const onLoadEnd = () => {
    Animated.timing(opacity.current, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  };

  return isIos ? (
    <Animated.Image
      source={{ uri: source, headers }}
      onLoadEnd={onLoadEnd}
      style={[styles.image, { opacity: opacity.current }, style]}
      {...rest}
    />
  ) : (
    <NativeImage source={{ uri: source, headers }} style={[styles.image, style]} {...rest} />
  );
}
