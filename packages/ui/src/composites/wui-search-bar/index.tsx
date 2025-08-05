import { useRef, useState } from 'react';
import { TextInput, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { InputElement } from '../wui-input-element';
import { InputText } from '../wui-input-text';
import { Spacing } from '../../utils/ThemeUtil';
import { FlexView } from '../../layout/wui-flex';

export interface SearchBarProps {
  placeholder?: string;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onChangeText?: TextInputProps['onChangeText'];
  inputStyle?: TextInputProps['style'];
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({
  placeholder = 'Search',
  onSubmitEditing,
  onChangeText,
  inputStyle,
  style
}: SearchBarProps) {
  const [showClear, setShowClear] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleChangeText = (text: string) => {
    setShowClear(!!text?.length);
    onChangeText?.(text);
  };

  return (
    <FlexView style={style}>
      <InputText
        ref={inputRef}
        placeholder={placeholder}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmitEditing}
        icon="search"
        inputStyle={inputStyle}
        returnKeyType="search"
        disableFullscreenUI
      >
        {showClear ? (
          <InputElement
            icon="close"
            style={{ marginRight: Spacing['4xs'] }}
            onPress={() => {
              inputRef.current?.clear();
              inputRef.current?.focus();
              handleChangeText('');
            }}
          />
        ) : null}
      </InputText>
    </FlexView>
  );
}
