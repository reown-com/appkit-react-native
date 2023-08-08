import React from 'react';
import { TouchableOpacity, TouchableOpacityProps as NativeProps } from 'react-native';
import { Text } from '../../components/wui-text';
import useTheme from '../../hooks/useTheme';

import styles from './styles';

export type ButtonProps = NativeProps & {
  size?: 'md' | 'sm';
  variant?: 'fill' | 'accent' | 'shade';
  disabled?: boolean;
  iconLeft?: string;
  iconRight?: string;
}

export function Button({ children, size = 'md', variant = 'fill', ...rest }: ButtonProps){
  const Theme = useTheme();

  return <TouchableOpacity style={[styles.container, { backgroundColor: Theme['blue-100']}]} {...rest}>
    <Text style={{color: Theme['inverse-100']}}>{children}</Text>
  </TouchableOpacity>
}