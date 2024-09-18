import { TextInput } from 'react-native';
import { FlexView, useTheme } from '@reown/appkit-ui-react-native';
import { SendController } from '@reown/appkit-core-react-native';
import styles from './styles';

export interface InputAddressProps {
  value?: string;
}

export function InputAddress({ value }: InputAddressProps) {
  const Theme = useTheme();

  const onInputChange = (address: string) => {
    SendController.setReceiverAddress(address);
  };

  return (
    <FlexView
      style={[
        styles.container,
        { backgroundColor: Theme['gray-glass-005'], borderColor: Theme['gray-glass-005'] }
      ]}
      justifyContent="center"
      padding={['xl', 'l', 'l', 'l']}
    >
      <TextInput
        placeholder="Type or paste address"
        placeholderTextColor={Theme['fg-275']}
        returnKeyType="done"
        style={[styles.input, { color: Theme['fg-100'] }]}
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onInputChange}
        keyboardType="default"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        selectionColor={Theme['accent-100']}
        underlineColorAndroid="transparent"
        selectTextOnFocus={false}
        numberOfLines={1}
      />
    </FlexView>
  );
}
