import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import styles from './styles';
import { useTheme } from '../../hooks/useTheme';

export interface OverlayProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Overlay({ children, style }: OverlayProps) {
  const Theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Theme['gray-glass-030'] }, style]}>
      {children}
    </View>
  );
}
