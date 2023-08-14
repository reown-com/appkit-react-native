import { ReactNode } from 'react';
import { View } from 'react-native';

import useTheme from '../../hooks/useTheme';
import styles from './styles';

export interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  const Theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Theme['bg-125'], borderColor: Theme['overlay-005'] }
      ]}
    >
      {children}
    </View>
  );
}
