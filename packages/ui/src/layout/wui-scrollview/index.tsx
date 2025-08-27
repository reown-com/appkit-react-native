import {
  ScrollView as RNScrollView,
  type ScrollViewProps as RNScrollViewProps
} from 'react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';

// Header size
const HEIGHT_OFFSET = 50;

export type ScrollViewProps = RNScrollViewProps & {
  disablePadding?: boolean;
};

export function ScrollView({ children, style, disablePadding, ...props }: ScrollViewProps) {
  const { padding, maxHeight } = useCustomDimensions();

  return (
    <RNScrollView
      bounces={false}
      fadingEdgeLength={20}
      {...props}
      style={[
        {
          paddingHorizontal: disablePadding ? undefined : padding,
          maxHeight: maxHeight - HEIGHT_OFFSET
        },
        style
      ]}
    >
      {children}
    </RNScrollView>
  );
}
