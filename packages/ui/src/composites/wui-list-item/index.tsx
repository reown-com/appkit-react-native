import type { ReactNode } from 'react';
import { View, Pressable, Animated, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { IconType } from '../../utils/TypesUtil';
import { IconBox } from '../wui-icon-box';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListItemProps {
  icon?: IconType;
  iconVariant?: 'blue' | 'overlay' | 'square';
  variant?: 'image' | 'icon';
  imageSrc?: string;
  chevron?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ListItem({
  children,
  icon,
  variant,
  imageSrc,
  iconVariant = 'blue',
  chevron,
  loading,
  disabled,
  onPress,
  style
}: ListItemProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['overlay-002'],
    Theme['overlay-010']
  );

  function visualTemplate() {
    if (variant === 'image' && imageSrc) {
      return (
        <Image
          source={imageSrc}
          style={[
            styles.image,
            (disabled || loading) && styles.disabledImage,
            { borderColor: Theme['overlay-005'] }
          ]}
        />
      );
    } else if (variant === 'icon' && iconVariant === 'square' && icon) {
      return <Icon name={icon} width={36} height={36} style={styles.squareIcon} />;
    } else if (variant === 'icon' && icon) {
      const iconColor = iconVariant === 'blue' ? 'blue-100' : 'fg-200';
      const borderColor = iconVariant === 'blue' ? 'blue-005' : 'overlay-002';

      return (
        <IconBox
          icon={icon}
          iconColor={iconColor}
          size="md"
          background
          style={[styles.icon, { borderColor: Theme[borderColor] }]}
        />
      );
    }

    return null;
  }

  function rightTemplate() {
    if (loading) {
      return <LoadingSpinner color="fg-200" size="md" />;
    } else if (chevron) {
      return <Icon name="chevronRight" size="sm" color="fg-200" />;
    }

    return null;
  }

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      style={[
        styles.container,
        { backgroundColor: disabled || loading ? Theme['overlay-010'] : animatedValue },
        style
      ]}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
    >
      {visualTemplate()}
      <View style={styles.content}>{children}</View>
      {rightTemplate()}
    </AnimatedPressable>
  );
}
