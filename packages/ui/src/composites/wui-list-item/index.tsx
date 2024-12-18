import type { ReactNode } from 'react';
import { View, Pressable, Animated, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType } from '../../utils/TypesUtil';
import { IconBox } from '../wui-icon-box';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ListItemProps {
  icon?: IconType;
  iconColor?: ColorType;
  iconBackgroundColor?: ColorType;
  iconBorderColor?: ColorType;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  chevron?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ListItem({
  children,
  icon,
  imageSrc,
  imageHeaders,
  iconColor = 'fg-200',
  iconBackgroundColor,
  iconBorderColor = 'gray-glass-005',
  chevron,
  loading,
  disabled,
  onPress,
  style,
  contentStyle,
  testID
}: ListItemProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  function visualTemplate() {
    if (imageSrc) {
      return (
        <View style={[styles.imageContainer, { borderColor: Theme['gray-glass-005'] }]}>
          <Image
            source={imageSrc}
            headers={imageHeaders}
            style={[styles.image, (disabled || loading) && styles.disabledImage]}
          />
        </View>
      );
    } else if (icon) {
      return (
        <View style={[styles.imageContainer, { borderColor: Theme[iconBorderColor] }]}>
          <IconBox
            icon={icon}
            iconColor={iconColor}
            size="md"
            background
            backgroundColor={iconBackgroundColor}
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
      return <Icon name="chevronRight" size="md" color="fg-200" style={styles.rightIcon} />;
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
      testID={testID}
    >
      {visualTemplate()}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {rightTemplate()}
    </AnimatedPressable>
  );
}
