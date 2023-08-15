import { View } from 'react-native';
import { Text } from '../../components/wui-text';
import useTheme from '../../hooks/useTheme';
import { ColorType, IconType } from '../../utils/TypesUtil';
import { IconBox } from '../wui-icon-box';
import styles from './styles';

export interface SnackbarProps {
  message: string;
  iconColor: ColorType;
  icon: IconType;
}

export function Snackbar({ message, iconColor, icon }: SnackbarProps) {
  const Theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Theme['bg-175'], borderColor: Theme['overlay-005'] }
      ]}
    >
      <IconBox icon={icon} iconColor={iconColor} size="md" background />
      <Text variant="paragraph-500" color="fg-100" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}
