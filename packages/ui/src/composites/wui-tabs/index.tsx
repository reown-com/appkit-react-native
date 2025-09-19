import { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import type { TabOptionType } from '../../utils/TypesUtil';
import styles from './styles';

export interface TabsProps {
  onTabChange: (index: number) => void;
  tabs: TabOptionType[] | string[];
  style?: StyleProp<ViewStyle>;
}

export function Tabs({ tabs, onTabChange, style }: TabsProps) {
  const Theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const animatedPosition = useRef(new Animated.Value(0));
  const [viewWidth, setViewWidth] = useState(1);
  const tabWidth = Math.trunc(viewWidth / tabs.length) - 2;

  const onTabPress = (index: number) => {
    setActiveTab(index);
    onTabChange(index);
    Animated.timing(animatedPosition.current, {
      toValue: index,
      duration: 120,
      useNativeDriver: false
    }).start();
  };

  const markPosition = animatedPosition.current.interpolate({
    inputRange: [0, tabs.length - 1],
    outputRange: [0, tabWidth * (tabs.length - 1)]
  });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setViewWidth(width);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Theme['gray-glass-002'] }, style]}
      onLayout={onLayout}
    >
      <Animated.View
        style={[
          styles.activeMark,
          {
            backgroundColor: Theme['gray-glass-005'],
            borderColor: Theme['gray-glass-005'],
            left: markPosition,
            width: tabWidth
          }
        ]}
      />
      {tabs.map((option, index) => {
        const isActive = index === activeTab;
        const isString = typeof option === 'string';

        return (
          <Pressable
            onPress={() => onTabPress(index)}
            key={isString ? option : option.label}
            style={[styles.tabItem, { width: tabWidth }]}
          >
            {!isString && option.icon ? (
              <Icon
                name={option.icon}
                size="xs"
                color={isActive ? 'fg-100' : 'fg-200'}
                style={styles.tabIcon}
              />
            ) : null}
            <Text variant="small-600" color={isActive ? 'fg-100' : 'fg-200'}>
              {isString ? option : option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
