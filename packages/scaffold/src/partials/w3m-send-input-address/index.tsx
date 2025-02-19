import { useState } from 'react';
import { FlexView, useTheme } from '@reown/appkit-ui-react-native';
import { ConnectionController, SendController } from '@reown/appkit-core-react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { useDebounceCallback } from '../../hooks/useDebounceCallback';
import styles from './styles';

export interface SendInputAddressProps {
  value?: string;
}

export function SendInputAddress({ value }: SendInputAddressProps) {
  const Theme = useTheme();
  const [inputValue, setInputValue] = useState<string | undefined>(value);

  const onSearch = async (search: string) => {
    SendController.setLoading(true);
    const address = await ConnectionController.getEnsAddress(search);
    SendController.setLoading(false);

    if (address) {
      SendController.setReceiverProfileName(search);
      SendController.setReceiverAddress(address);
      const avatar = await ConnectionController.getEnsAvatar(search);
      SendController.setReceiverProfileImageUrl(avatar || undefined);
    } else {
      SendController.setReceiverAddress(search);
      SendController.setReceiverProfileName(undefined);
      SendController.setReceiverProfileImageUrl(undefined);
    }
  };

  const { debouncedCallback: onDebounceSearch } = useDebounceCallback({
    callback: onSearch,
    delay: 800
  });

  const onInputChange = (address: string) => {
    setInputValue(address);
    SendController.setReceiverAddress(address);
    onDebounceSearch(address);
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
      <BottomSheetTextInput
        placeholder="Type or paste address"
        placeholderTextColor={Theme['fg-275']}
        returnKeyType="done"
        style={[styles.input, { color: Theme['fg-100'] }]}
        autoCapitalize="none"
        autoCorrect={false}
        value={inputValue}
        onChangeText={onInputChange}
        keyboardType="default"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        selectionColor={Theme['accent-100']}
        underlineColorAndroid="transparent"
        selectTextOnFocus={false}
        returnKeyLabel="Done"
      />
    </FlexView>
  );
}
