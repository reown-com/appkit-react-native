import React, { useState } from 'react';
import {
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  type StyleProp,
  type ViewStyle,
  Dimensions
} from 'react-native';
import { FlexView } from '../../layout/wui-flex';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export interface ExpandableListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemWidth: number;
  style?: StyleProp<ViewStyle>;
  renderToggle?: (isExpanded: boolean, onPress: () => void) => React.ReactNode;
  containerPadding?: number;
}

export function ExpandableList<T>({
  items,
  renderItem,
  itemWidth,
  renderToggle,
  style,
  containerPadding = 0
}: ExpandableListProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const availableWidth = screenWidth - containerPadding * 2;
  const itemsPerRow = Math.floor(availableWidth / itemWidth);
  const totalGapWidth = availableWidth - itemsPerRow * itemWidth;
  const marginHorizontal = Math.max(totalGapWidth / (itemsPerRow * 2), 0);
  const hasMoreItems = items.length > itemsPerRow;

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const visibleItems = isExpanded ? items : items.slice(0, itemsPerRow - 1);

  return (
    <FlexView style={style}>
      <FlexView flexDirection="row" flexWrap="wrap">
        {visibleItems.map((item, index) => (
          <View
            key={index}
            style={{
              width: itemWidth,
              marginHorizontal,
              marginBottom: marginHorizontal * 2
            }}
          >
            {renderItem(item)}
          </View>
        ))}
        {hasMoreItems && renderToggle && (
          <View
            style={{
              width: itemWidth,
              marginHorizontal,
              marginBottom: marginHorizontal * 2
            }}
          >
            {renderToggle(isExpanded, handleToggle)}
          </View>
        )}
      </FlexView>
    </FlexView>
  );
}
