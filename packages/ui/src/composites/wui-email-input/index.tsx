import { View } from 'react-native';
import { Text } from '../../components/wui-text';
import { InputText, type InputTextProps } from '../wui-input-text';

import styles from './styles';

export type EmailInputProps = InputTextProps & {
  errorMessage?: string;
};

export function EmailInput({ errorMessage, ...rest }: EmailInputProps) {
  return (
    <View>
      <InputText icon="mail" placeholder="Email" size="md" {...rest} />
      <Text color="error-100" variant="tiny-500" style={styles.text}>
        {errorMessage}
      </Text>
    </View>
  );
}
