import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { Button } from '../wui-button';
import styles from './styles';

export interface TokenButtonProps {
  onPress?: () => void;
  imageUrl?: string;
  symbol?: string;
}

export function TokenButton({ imageUrl, symbol, onPress }: TokenButtonProps) {
  if (!symbol) {
    return (
      <Button variant="accent" style={styles.selectButton} size="sm" onPress={onPress}>
        <Text variant="small-600" color="accent-100">
          Select token
        </Text>
      </Button>
    );
  }

  return (
    <Button variant="shade" style={styles.container} size="sm" onPress={onPress}>
      {imageUrl && <Image source={imageUrl} style={styles.image} />}
      <Text>{symbol}</Text>
    </Button>
  );
}
