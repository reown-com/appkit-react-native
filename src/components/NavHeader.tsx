import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import Backward from '../assets/Backward';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Props {
  title: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionIcon?: any;
  actionDisabled?: boolean;
}

function NavHeader({
  title,
  onBackPress,
  onActionPress,
  actionIcon,
  actionDisabled,
}: Props) {
  const Theme = useColorScheme() === 'dark' ? DarkTheme : LightTheme;
  const ActionIcon = actionIcon;

  return (
    <View style={styles.container}>
      {onBackPress ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onBackPress}
          disabled={actionDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Backward height={18} width={10} fill={Theme.accent} />
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
      <Text style={[styles.title, { color: Theme.foreground1 }]}>{title}</Text>
      {actionIcon && onActionPress ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onActionPress}
          disabled={actionDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ActionIcon
            width={22}
            height={22}
            fill={actionDisabled ? Theme.foreground3 : Theme.accent}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button: {
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
  },
});

export default NavHeader;
