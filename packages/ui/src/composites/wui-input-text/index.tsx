import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';
import { Animated, Pressable, TextInput, TextInputProps } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import useTheme from '../../hooks/useTheme';
import { ColorType, IconType, SizeType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface InputRef {
  clear: () => void;
  focus: () => void;
  blur: () => void;
}

export interface InputTextProps {
  placeholder?: string;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  onChangeText?: TextInputProps['onChangeText'];
  inputStyle?: TextInputProps['style'];
  children?: ReactNode;
  icon?: IconType;
  disabled?: boolean;
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
}

export const InputText = forwardRef<InputRef, InputTextProps>(
  (
    {
      children,
      placeholder,
      onSubmitEditing,
      onChangeText,
      inputStyle,
      icon,
      size = 'sm',
      disabled
    }: InputTextProps,
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    const Theme = useTheme();
    const { animatedValue, valueRef, setStartValue, setEndValue } = useAnimatedValue(
      Theme['overlay-005'],
      Theme['overlay-010'],
      100
    );

    useImperativeHandle(ref, () => ({
      clear: () => {
        if (inputRef.current) {
          inputRef.current.clear();
        }
      },
      focus: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
      blur: () => {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    }));

    const innerBorder = valueRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [Theme['overlay-005'], Theme['blue-100']]
    });

    const outerBorder = valueRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', Theme['blue-015']]
    });

    return (
      <AnimatedPressable
        style={[styles.outerBorder, { borderColor: outerBorder }]}
        disabled={disabled}
        onPress={() => inputRef.current?.focus()}
      >
        <Animated.View
          style={[
            styles[`${size}Container`],
            { backgroundColor: animatedValue, borderColor: innerBorder },
            disabled && { backgroundColor: Theme['overlay-015'] }
          ]}
        >
          {icon && <Icon name={icon} size="md" color={'fg-275' as ColorType} style={styles.icon} />}
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
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            underlineColorAndroid="transparent"
            selectTextOnFocus={false}
            editable={!disabled}
          />
          {children}
        </Animated.View>
      </AnimatedPressable>
    );
  }
);
