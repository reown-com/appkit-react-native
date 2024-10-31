import { type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../components/wui-text';
import { LeanView } from '../../components/wui-lean-view';
import { FlexView } from '../../layout/wui-flex';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export interface SeparatorProps {
  text?: string;
  style?: StyleProp<ViewStyle>;
}

export function Separator({ text, style }: SeparatorProps) {
  const Theme = useTheme();

  if (!text) {
    return (
      <LeanView style={[styles.single, { backgroundColor: Theme['gray-glass-005'] }, style]} />
    );
  }

  return (
    <FlexView flexDirection="row" alignItems="center" style={style}>
      <LeanView
        style={[styles.divider, styles.marginRight, { backgroundColor: Theme['gray-glass-005'] }]}
      />
      <Text variant="small-500" color="fg-300">
        {text}
      </Text>
      <LeanView
        style={[styles.divider, styles.marginLeft, { backgroundColor: Theme['gray-glass-005'] }]}
      />
    </FlexView>
  );
}
