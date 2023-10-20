import { View } from 'react-native';
import styles from './styles';
import { useTheme } from '../../hooks/useTheme';

export function Separator() {
  const Theme = useTheme();

  return <View style={[styles.container, { backgroundColor: Theme['gray-glass-005'] }]} />;
}
