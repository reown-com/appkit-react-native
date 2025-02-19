import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType } from '../../utils/TypesUtil';
import { IconBox } from '../wui-icon-box';
import styles from './styles';
import { LoadingSpinner } from '../../components/wui-loading-spinner';

export interface SnackbarProps {
  message: string;
  iconColor: ColorType;
  icon: IconType | 'loading';
  style?: StyleProp<ViewStyle>;
}

export function Snackbar({ message, iconColor, icon, style }: SnackbarProps) {
  const Theme = useTheme();

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { backgroundColor: Theme['bg-175'], borderColor: Theme['gray-glass-005'] },
        style
      ]}
    >
      {icon === 'loading' ? (
        <LoadingSpinner size="md" />
      ) : (
        <IconBox icon={icon} iconColor={iconColor} size="sm" background />
      )}
      <Text
        variant="paragraph-500"
        color="fg-100"
        style={styles.text}
        testID="wui-snackbar-message"
      >
        {message}
      </Text>
    </Animated.View>
  );
}
