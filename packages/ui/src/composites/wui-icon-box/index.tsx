import { type StyleProp, View, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius } from '../../utils/ThemeUtil';
import type { ColorType, IconType, SizeType, ThemeKeys } from '../../utils/TypesUtil';
import styles from './styles';

export interface IconBoxProps {
  icon: IconType;
  size?: Exclude<SizeType, 'xs' | 'xxs'>;
  iconColor?: ColorType;
  background?: boolean;
  backgroundColor?: ThemeKeys;
  border?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconBox({
  size,
  iconColor = 'fg-100',
  icon,
  background,
  backgroundColor,
  border,
  style
}: IconBoxProps) {
  const Theme = useTheme();
  let iconSize: SizeType = 'xxs';
  switch (size) {
    case 'lg':
      iconSize = 'lg';
      break;
    case 'md':
      iconSize = 'sm';
      break;
    case 'sm':
      iconSize = 'xs';
      break;
    default:
      iconSize = 'xxs';
  }

  let boxSize: number;
  switch (size) {
    case 'lg':
      boxSize = 40;
      break;
    case 'md':
      boxSize = 32;
      break;
    default:
      boxSize = 24;
  }

  const borderRadius = size === 'lg' ? 'xxs' : '3xl';

  const backgroundStyle = {
    backgroundColor:
      background && backgroundColor
        ? Theme[backgroundColor]
        : background
        ? `${Theme[iconColor as ThemeKeys]}1E`
        : 'transparent',
    borderRadius: BorderRadius[borderRadius]
  };

  const containerSize = boxSize + (border ? 4 : 0);

  return (
    <View
      style={[
        styles.box,
        backgroundStyle,
        { height: containerSize, width: containerSize },
        border && { borderColor: Theme['bg-125'] },
        border && styles.border,
        style
      ]}
    >
      <Icon size={iconSize} color={iconColor} name={icon} />
    </View>
  );
}
