import { useRef, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { InputElement } from '../wui-input-element';
import { InputText } from '../wui-input-text';

export interface SearchBarProps {
  placeholder?: string;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onChangeText?: TextInputProps['onChangeText'];
  inputStyle?: TextInputProps['style'];
}

export function SearchBar({
  placeholder = 'Search wallet',
  onSubmitEditing,
  onChangeText,
  inputStyle
}: SearchBarProps) {
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    setShowClear(!!text?.length);
    onChangeText?.(text);
  };

  return (
    <InputText
      ref={inputRef}
      placeholder={placeholder}
      onChangeText={handleChangeText}
      onSubmitEditing={onSubmitEditing}
      icon="search"
      inputStyle={inputStyle}
      returnKeyType="search"
    >
      {showClear && (
        <InputElement
          icon="close"
          onPress={() => {
            inputRef.current?.clear();
            inputRef.current?.focus();
            handleChangeText('');
          }}
        />
      )}
    </InputText>
  );
}
