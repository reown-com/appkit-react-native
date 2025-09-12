import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle, View } from 'react-native';

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
        { backgroundColor: Theme['bg-100'], borderColor: Theme['gray-glass-015'] },
        style
      ]}
    >
      {children}
    </View>
  );
}
