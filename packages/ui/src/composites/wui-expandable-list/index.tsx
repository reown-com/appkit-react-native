import React, { forwardRef, useImperativeHandle, useState } from 'react';
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
  renderToggle?: (isExpanded: boolean) => React.ReactNode;
  containerPadding?: number;
}

export interface ExpandableListRef {
  toggle: (expanded?: boolean) => void;
  getItemsPerRow: () => number;
  isExpanded: boolean;
}

export const ExpandableList = forwardRef<ExpandableListRef, ExpandableListProps<any>>(
  ({ items, renderItem, itemWidth, renderToggle, style, containerPadding = 0 }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const screenWidth = Dimensions.get('window').width;
    const availableWidth = screenWidth - containerPadding * 2;
    const itemsPerRow = Math.floor(availableWidth / itemWidth);
    const totalGapWidth = availableWidth - itemsPerRow * itemWidth;
    const marginHorizontal = Math.max(totalGapWidth / (itemsPerRow * 2), 0);

    const handleToggle = (expanded?: boolean) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(expanded ?? !isExpanded);
    };

    useImperativeHandle(ref, () => ({
      toggle: handleToggle,
      getItemsPerRow: () => itemsPerRow,
      isExpanded
    }));

    const hasMoreItems = items.length > itemsPerRow;
    const visibleItems = isExpanded
      ? items
      : items.slice(0, hasMoreItems ? itemsPerRow - 1 : itemsPerRow);

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
              {renderToggle(isExpanded)}
            </View>
          )}
        </FlexView>
      </FlexView>
    );
  }
);
