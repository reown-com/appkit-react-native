import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Animated,
  Pressable,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextInputProps
} from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { IconType, SizeType } from '../../utils/TypesUtil';
import styles, { outerBorderRadius } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface InputRef {
  clear: () => void;
  focus: () => void;
  blur: () => void;
}

export type InputTextProps = TextInputProps & {
  inputStyle?: TextInputProps['style'];
  icon?: IconType;
  disabled?: boolean;
  size?: Exclude<SizeType, 'xl' | 'lg' | 'xxs'>;
};

export const InputText = forwardRef<InputRef, InputTextProps>(
  (
    {
      children,
      placeholder,
      inputStyle,
      icon,
      size = 'sm',
      disabled,
      returnKeyType,
      onBlur,
      onFocus,
      ...rest
    }: InputTextProps,
    ref
  ) => {
    const inputRef = useRef<TextInput>(null);
    const Theme = useTheme();
    const { animatedValue, valueRef, setStartValue, setEndValue } = useAnimatedValue(
      Theme['gray-glass-002'],
      Theme['gray-glass-005'],
      100
    );
    const outerRadius = outerBorderRadius[size];

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

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setStartValue();
      onBlur?.(e);
    };

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setEndValue();
      onFocus?.(e);
    };

    const innerBorder = valueRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: [Theme['gray-glass-005'], Theme['accent-100']]
    });

    const outerBorder = valueRef.current.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', Theme['accent-glass-015']]
    });

    return (
      <>
        <AnimatedPressable
          style={[styles.outerBorder, { borderColor: outerBorder, borderRadius: outerRadius }]}
          disabled={disabled}
          onPress={() => inputRef.current?.focus()}
        >
          <Animated.View
            style={[
              styles[`${size}Container`],
              { backgroundColor: animatedValue, borderColor: innerBorder },
              disabled && { backgroundColor: Theme['gray-glass-002'] }
            ]}
          >
            {icon && <Icon name={icon} size="md" color="fg-275" style={styles.icon} />}
            <TextInput
              ref={inputRef}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              placeholderTextColor={Theme['fg-275']}
              returnKeyType={returnKeyType}
              style={[styles.input, { color: Theme['fg-100'] }, inputStyle]}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              selectionColor={Theme['accent-100']}
              underlineColorAndroid="transparent"
              selectTextOnFocus={false}
              editable={!disabled}
              testID="wui-input-text"
              {...rest}
            />
            {children}
          </Animated.View>
        </AnimatedPressable>
      </>
    );
  }
);
