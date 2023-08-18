import { useRef, useState } from 'react';
import { Animated, Pressable, TextInput, TextInputProps } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import useTheme from '../../hooks/useTheme';
import { ColorType } from '../../utils/TypesUtil';
import { InputElement } from '../wui-input-element';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const Theme = useTheme();
  const { animatedValue, valueRef, setStartValue, setEndValue } = useAnimatedValue(
    Theme['overlay-005'],
    Theme['overlay-010'],
    100
  );

  const innerBorder = valueRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: [Theme['overlay-005'], Theme['blue-100']]
  });

  const outerBorder = valueRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', Theme['blue-015']]
  });

  const handleChangeText = (text?: string) => {
    setShowClear(!!text?.length);
  };

  return (
    <AnimatedPressable style={[styles.focusedBorder, { borderColor: outerBorder }]}>
      <AnimatedPressable
        style={[styles.container, { backgroundColor: animatedValue, borderColor: innerBorder }]}
        onPress={() => inputRef.current?.focus()}
      >
        <Icon name="search" size="xs" color={'fg-275' as ColorType} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          onFocus={setEndValue}
          onBlur={setStartValue}
          placeholder={placeholder}
          placeholderTextColor={Theme['fg-275']}
          returnKeyType="search"
          style={[styles.input, { color: Theme['fg-100'] }, inputStyle]}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          selectionColor={Theme['blue-100']}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmitEditing}
          underlineColorAndroid="transparent"
          selectTextOnFocus={false}
        />
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
      </AnimatedPressable>
    </AnimatedPressable>
  );
}
