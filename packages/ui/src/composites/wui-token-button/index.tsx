import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { Button } from '../wui-button';
import styles from './styles';

export interface TokenButtonProps {
  text: string;
  imageSrc?: string;
}

export function TokenButton({ text, imageSrc }: TokenButtonProps) {
  return (
    <Button variant="shade" style={styles.container} size="sm">
      {imageSrc && <Image source={imageSrc} style={styles.image} />}
      <Text>{text}</Text>
    </Button>
  );
}
