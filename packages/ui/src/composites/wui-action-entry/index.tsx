import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, IconType } from '../../utils/TypesUtil';
import { Icon } from '../../components/wui-icon';

import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ActionEntryProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  iconLeft?: IconType;
  style?: StyleProp<ViewStyle>;
}

export function ActionEntry({ label, onPress, disabled, iconLeft, style }: ActionEntryProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['overlay-002'],
    Theme['overlay-010']
  );

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { backgroundColor: disabled ? Theme['overlay-010'] : animatedValue },
        style
      ]}
      disabled={disabled}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
    >
      {iconLeft && (
        <Icon
          size="sm"
          name={iconLeft}
          color={disabled ? ('overlay-015' as ColorType) : 'fg-200'}
          style={styles.icon}
        />
      )}
      <Text
        variant="paragraph-600"
        numberOfLines={1}
        color={disabled ? ('overlay-015' as ColorType) : 'fg-200'}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
