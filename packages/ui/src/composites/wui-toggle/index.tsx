import { useState, useRef } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
  Pressable
} from 'react-native';

import { IconBox } from '../wui-icon-box';
import { FlexView } from '../../layout/wui-flex';
import { Text } from '../../components/wui-text';
import styles from './styles';

export interface ToggleProps {
  children?: React.ReactNode;
  title?: string | React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Toggle({ children, style, title = 'Details' }: ToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);

  const toggleDetails = () => {
    const toValue = isOpen ? 0 : contentHeight.current;

    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      bounciness: 0
    }).start();

    setIsOpen(!isOpen);
  };

  const measureContent = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    contentHeight.current = height;
  };

  return (
    <FlexView style={[styles.container, style]}>
      <Pressable onPress={toggleDetails} style={styles.header}>
        {typeof title === 'string' ? (
          <Text variant="small-400" color="fg-100">
            {title}
          </Text>
        ) : (
          title
        )}
        <IconBox icon={isOpen ? 'chevronTop' : 'chevronBottom'} size="sm" iconColor="fg-200" />
      </Pressable>

      <Animated.View style={[styles.contentWrapper, { height: animatedHeight }]}>
        <FlexView style={styles.content} onLayout={measureContent}>
          {children}
        </FlexView>
      </Animated.View>
    </FlexView>
  );
}
