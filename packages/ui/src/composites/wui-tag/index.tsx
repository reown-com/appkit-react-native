import type { ReactNode } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import styles, { getThemedColors } from './styles';
import type { ColorType, TagType, ThemeKeys } from '../../utils/TypesUtil';

export interface TagProps {
  children: ReactNode;
  variant?: TagType;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Tag({ variant = 'main', children, style, disabled }: TagProps) {
  const Theme = useTheme();
  const colors = getThemedColors(disabled ? undefined : variant);

  return (
    <View
      style={[styles.container, { backgroundColor: Theme[colors.background as ThemeKeys] }, style]}
    >
      <Text style={styles.text} variant="micro-700" color={colors.text as ColorType}>
        {children}
      </Text>
    </View>
  );
}
