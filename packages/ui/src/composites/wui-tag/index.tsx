import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export interface TagProps {
  children: ReactNode;
  variant?: 'main' | 'shade';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Tag({ variant = 'main', children, style, disabled }: TagProps) {
  const Theme = useTheme();
  const backgroundColor =
    variant === 'shade' || disabled ? Theme['overlay-010'] : Theme['blue-015'];
  const textColor = disabled ? 'fg-300' : variant === 'main' ? 'blue-100' : 'fg-200';

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text style={styles.text} variant="micro-700" color={textColor}>
        {children}
      </Text>
    </View>
  );
}
