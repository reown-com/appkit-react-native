import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  const Theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Theme['bg-125'], borderColor: Theme['gray-glass-005'] },
        style
      ]}
    >
      {children}
    </View>
  );
}
