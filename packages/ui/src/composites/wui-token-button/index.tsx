import type { StyleProp, ViewStyle } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { Button } from '../wui-button';
import styles from './styles';

export interface TokenButtonProps {
  onPress?: () => void;
  imageUrl?: string;
  text?: string;
  inverse?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function TokenButton({
  imageUrl,
  text,
  inverse,
  onPress,
  style,
  disabled = false
}: TokenButtonProps) {
  if (!text) {
    return (
      <Button
        variant="accent"
        style={[styles.selectButton, style]}
        size="sm"
        onPress={onPress}
        disabled={disabled}
      >
        <Text variant="small-600" color="accent-100">
          Select token
        </Text>
      </Button>
    );
  }

  const content = [
    imageUrl && (
      <Image key="image" source={imageUrl} style={[styles.image, inverse && styles.imageInverse]} />
    ),
    <Text key="text">{text}</Text>
  ];

  return (
    <Button
      variant="shade"
      style={[styles.container, style]}
      size="sm"
      onPress={onPress}
      disabled={disabled}
    >
      {inverse ? content.reverse() : content}
    </Button>
  );
}
