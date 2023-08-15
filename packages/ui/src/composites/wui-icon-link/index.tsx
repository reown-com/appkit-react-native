import { Animated, Pressable } from 'react-native';
import { Icon } from '../../components/wui-icon';
import useAnimatedColor from '../../hooks/useAnimatedColor';
import useTheme from '../../hooks/useTheme';
import { ColorType, IconType, SizeType } from '../../utils/TypesUtil';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconLinkProps {
  icon: IconType;
  onPress?: () => void;
  size?: Exclude<SizeType, 'xs' | 'xxs'>;
  iconColor?: ColorType;
  disabled?: boolean;
}

export function IconLink({
  icon,
  onPress,
  size = 'md',
  iconColor = 'fg-100',
  disabled
}: IconLinkProps) {
  const Theme = useTheme();
  const { animatedColor, setStartColor, setEndColor } = useAnimatedColor(
    'transparent',
    Theme['overlay-010']
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndColor}
      onPressOut={setStartColor}
      disabled={disabled}
      style={[styles.container, { backgroundColor: animatedColor }]}
    >
      <Icon name={icon} size={size} color={disabled ? ('overlay-020' as ColorType) : iconColor} />
    </AnimatedPressable>
  );
}
