import { type StyleProp, View, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius } from '../../utils/ThemeUtil';
import type { ColorType, IconType, SizeType, ThemeKeys } from '../../utils/TypesUtil';
import styles from './styles';

export interface IconBoxProps {
  icon: IconType;
  size?: Exclude<SizeType, 'xl' | 'xs' | 'xxs'>;
  iconColor?: ColorType;
  iconSize?: Exclude<SizeType, 'xl'>;
  background?: boolean;
  backgroundColor?: ThemeKeys;
  border?: boolean;
  borderColor?: ThemeKeys;
  borderSize?: number;
  style?: StyleProp<ViewStyle>;
}

export function IconBox({
  size,
  iconColor = 'fg-100',
  icon,
  iconSize,
  background,
  backgroundColor,
  border,
  borderColor,
  borderSize = 4,
  style
}: IconBoxProps) {
  const Theme = useTheme();
  let _iconSize: SizeType;
  switch (size) {
    case 'lg':
      _iconSize = 'lg';
      break;
    case 'md':
      _iconSize = 'sm';
      break;
    case 'sm':
      _iconSize = 'xs';
      break;
    default:
      _iconSize = 'xxs';
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

  const containerSize = boxSize + (border ? borderSize : 0);

  return (
    <View
      style={[
        styles.box,
        backgroundStyle,
        { height: containerSize, width: containerSize },
        border && { borderColor: Theme[borderColor || 'bg-125'], borderWidth: borderSize / 2 },
        style
      ]}
    >
      <Icon size={iconSize || _iconSize} color={iconColor} name={icon} />
    </View>
  );
}
