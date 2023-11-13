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
  iconVariant?: 'blue' | 'overlay';
  variant?: 'image' | 'icon';
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
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
  imageHeaders,
  iconVariant = 'blue',
  chevron,
  loading,
  disabled,
  onPress,
  style
}: ListItemProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  function visualTemplate() {
    if (variant === 'image' && imageSrc) {
      return (
        <View style={[styles.imageContainer, { borderColor: Theme['gray-glass-005'] }]}>
          <Image
            source={imageSrc}
            headers={imageHeaders}
            style={[styles.image, (disabled || loading) && styles.disabledImage]}
          />
        </View>
      );
    } else if (variant === 'icon' && icon) {
      const iconColor = iconVariant === 'blue' ? 'accent-100' : 'fg-200';
      const borderColor = iconVariant === 'blue' ? 'accent-glass-005' : 'gray-glass-005';

      return (
        <View style={[styles.imageContainer, { borderColor: Theme[borderColor] }]}>
          <IconBox
            icon={icon}
            iconColor={iconColor}
            size="md"
            background
            backgroundColor="gray-glass-010"
          />
        </View>
      );
    }

    return null;
  }

  function rightTemplate() {
    if (loading) {
      return <LoadingSpinner color="fg-200" size="lg" style={styles.rightIcon} />;
    } else if (chevron) {
      return <Icon name="chevronRight" size="sm" color="fg-200" style={styles.rightIcon} />;
    }

    return null;
  }

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      style={[
        styles.container,
        { backgroundColor: disabled || loading ? Theme['gray-glass-010'] : animatedValue },
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
