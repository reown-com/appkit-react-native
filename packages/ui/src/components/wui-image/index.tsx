import { Image as NativeImage, type ImageProps as NativeProps } from 'react-native';
import styles from './styles';

export type ImageProps = Omit<NativeProps, 'source'> & {
  source: string;
};

export function Image({ source, style, ...rest }: ImageProps) {
  return <NativeImage source={{ uri: source }} style={[styles.image, style]} {...rest} />;
}
