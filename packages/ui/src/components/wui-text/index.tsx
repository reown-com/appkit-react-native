import React from 'react';
import { Text as NativeText, TextProps as NativeProps } from "react-native";
import useTheme from '../../hooks/useTheme';
import { ColorType, TextType } from '../../utils/TypesUtil';
import styles from './styles';

export type TextProps = NativeProps & {
  color?: ColorType;
  variant?: TextType;
}

export function Text({ children, style, color = 'fg-100', variant = 'paragraph-500', ...rest }: TextProps) {
  const Theme = useTheme();

  return (
    <NativeText style={[styles.base, styles[variant], { color: Theme[color] }, style]} {...rest}>
      {children}
    </NativeText>
  )
}