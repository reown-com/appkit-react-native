import { useRef, useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';

import { InputElement } from '../wui-input-element';
import { InputText } from '../wui-input-text';

export interface SearchBarProps {
  placeholder?: string;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  inputStyle?: TextInputProps['style'];
}

export function SearchBar({
  placeholder = 'Search wallet',
  onSubmitEditing,
  inputStyle
}: SearchBarProps) {
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text?: string) => {
    setShowClear(!!text?.length);
  };

  return (
    <InputText
      ref={inputRef}
      placeholder={placeholder}
      onChangeText={handleChangeText}
      onSubmitEditing={onSubmitEditing}
      icon="search"
      inputStyle={inputStyle}
    >
      {showClear && (
        <InputElement
          icon="close"
          onPress={() => {
            inputRef.current?.clear();
            inputRef.current?.focus();
            setShowClear(false);
          }}
        />
      )}
    </InputText>
  );
}
