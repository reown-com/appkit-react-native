import { type ComponentType, createElement, forwardRef } from 'react';
import type { TextProps } from 'react-native';

const LeanText = forwardRef((props, ref) => {
  return createElement('RCTText', { ...props, ref });
}) as ComponentType<TextProps>;

LeanText.displayName = 'RCTText';

export { LeanText };
