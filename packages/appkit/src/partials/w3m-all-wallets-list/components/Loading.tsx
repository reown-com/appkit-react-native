import { CardSelectLoader, FlexView, useCustomDimensions } from '@reown/appkit-ui-react-native';
import { memo } from 'react';
import { type StyleProp, type ViewStyle, StyleSheet } from 'react-native';

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
      style={[styles.container, { maxWidth, maxHeight }]}
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
    </FlexView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center'
  }
});

export const Loading = memo(_Loading, () => {
  return true;
});
