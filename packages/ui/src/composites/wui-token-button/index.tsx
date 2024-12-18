import type { Balance } from '@reown/appkit-common-react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { Button } from '../wui-button';
import styles from './styles';

export interface TokenButtonProps {
  onPress?: () => void;
  token?: Balance;
}

export function TokenButton({ token, onPress }: TokenButtonProps) {
  if (!token) {
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
      {token?.iconUrl && <Image source={token?.iconUrl} style={styles.image} />}
      {token?.symbol && <Text>{token.symbol}</Text>}
    </Button>
  );
}
