import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { Icon } from '../../components/wui-icon';
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
  const colorAnimation = useRef(new Animated.Value(0));

  const onPressIn = () => {
    Animated.spring(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: true,
      overshootClamping: true
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: true,
      overshootClamping: true
    }).start();
  };

  const boxColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', Theme['overlay-010']]
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={[styles.container, { backgroundColor: boxColor }]}
    >
      <Icon name={icon} size={size} color={disabled ? 'fg-300' : iconColor} />
    </AnimatedPressable>
  );
}
