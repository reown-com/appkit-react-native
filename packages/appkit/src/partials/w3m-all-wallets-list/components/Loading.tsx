import { CardSelectLoader, FlexView, useCustomDimensions } from '@reown/appkit-ui-react-native';
import { memo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

interface LoadingProps {
  itemWidth?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

function _Loading({ itemWidth, containerStyle }: LoadingProps) {
  const { maxWidth, maxHeight } = useCustomDimensions();

  return (
    <FlexView
      flexDirection="row"
      flexWrap="wrap"
      alignSelf="center"
      padding={['0', '0', 's', 'xs']}
      style={{ maxWidth, maxHeight }}
    >
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
      <CardSelectLoader style={[containerStyle, { width: itemWidth }]} />
    </FlexView>
  );
}

export const Loading = memo(_Loading, () => {
  return true;
});
