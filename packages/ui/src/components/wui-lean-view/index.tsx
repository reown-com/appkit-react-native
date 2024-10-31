import { type ComponentType, createElement, forwardRef } from 'react';
import type { ViewProps } from 'react-native';

const LeanView = forwardRef((props, ref) => {
  return createElement('RCTView', { ...props, ref });
}) as ComponentType<ViewProps>;

LeanView.displayName = 'RCTView';

export { LeanView };
