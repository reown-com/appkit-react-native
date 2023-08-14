import { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '../../components/wui-text';
import useTheme from '../../hooks/useTheme';
import styles from './styles';

export interface TagProps {
  children: ReactNode;
  variant?: 'main' | 'shade';
}

export function Tag({ variant = 'main', children }: TagProps) {
  const Theme = useTheme();
  const backgroundColor = variant === 'main' ? Theme['blue-015'] : Theme['overlay-010'];
  const textColor = variant === 'main' ? 'blue-100' : 'fg-200';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text} variant="micro-700" color={textColor}>
        {children}
      </Text>
    </View>
  );
}
