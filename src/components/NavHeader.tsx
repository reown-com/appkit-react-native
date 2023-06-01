import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import Chevron from '../assets/Chevron.png';
import { DarkTheme, LightTheme } from '../constants/Colors';

interface Props {
  title: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionIcon?: any;
  actionIconStyle?: any;
  actionDisabled?: boolean;
}

function NavHeader({
  title,
  onBackPress,
  onActionPress,
  actionIcon,
  actionIconStyle,
  actionDisabled,
}: Props) {
  const Theme = useColorScheme() === 'dark' ? DarkTheme : LightTheme;

  return (
    <View style={styles.container}>
      {onBackPress ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onBackPress}
          disabled={actionDisabled}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image style={styles.backIcon} source={Chevron} />
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
          <Image
            style={[
              styles.actionIcon,
              actionIconStyle,
              actionDisabled && { tintColor: Theme.foreground3 },
            ]}
            source={actionIcon}
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
  backIcon: {
    width: 8,
    height: 18,
  },
  title: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
});

export default NavHeader;
