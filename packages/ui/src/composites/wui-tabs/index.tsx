import { useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import type { TabOptionType } from '../../utils/TypesUtil';
import styles from './styles';

export interface TabsProps {
  onTabChange: (index: number) => void;
  tabs: TabOptionType[];
}

export function Tabs({ tabs, onTabChange }: TabsProps) {
  const Theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const animatedPosition = useRef(new Animated.Value(0));

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
    outputRange: [0, 100 * (tabs.length - 1)]
  });

  return (
    <View style={[styles.container, { backgroundColor: Theme['gray-glass-002'] }]}>
      <Animated.View
        style={[
          styles.activeMark,
          {
            backgroundColor: Theme['gray-glass-005'],
            borderColor: Theme['gray-glass-005'],
            left: markPosition
          }
        ]}
      />
      {tabs.map((option, index) => {
        const isActive = index === activeTab;

        return (
          <Pressable onPress={() => onTabPress(index)} key={option.label} style={styles.tabItem}>
            {option.icon && (
              <Icon
                name={option.icon}
                size="xs"
                color={isActive ? 'fg-100' : 'fg-200'}
                style={styles.tabIcon}
              />
            )}
            <Text variant="small-600" color={isActive ? 'fg-100' : 'fg-200'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
