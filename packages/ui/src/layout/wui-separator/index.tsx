import { type StyleProp, type ViewStyle, View } from 'react-native';
import { Text } from '../../components/wui-text';
import { FlexView } from '../../layout/wui-flex';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType } from '../../utils/TypesUtil';
import styles from './styles';

export interface SeparatorProps {
  text?: string;
  color?: ColorType;
  style?: StyleProp<ViewStyle>;
}

export function Separator({ text, style, color = 'gray-glass-005' }: SeparatorProps) {
  const Theme = useTheme();

  if (!text) {
    return <View style={[styles.single, { backgroundColor: Theme[color] }, style]} />;
  }

  return (
    <FlexView flexDirection="row" alignItems="center" style={style}>
      <View style={[styles.divider, styles.marginRight, { backgroundColor: Theme[color] }]} />
      <Text variant="small-500" color="fg-300">
        {text}
      </Text>
      <View style={[styles.divider, styles.marginLeft, { backgroundColor: Theme[color] }]} />
    </FlexView>
  );
}
