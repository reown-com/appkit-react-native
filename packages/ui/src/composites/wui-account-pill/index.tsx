import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Avatar } from '../wui-avatar';
import { UiUtil } from '../../utils/UiUtil';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';
import { Icon } from '../../components/wui-icon';

export interface AccountPillProps {
  onPress: () => void;
  address?: string;
  profileName?: string;
  profileImage?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AccountPill({
  onPress,
  address,
  profileName,
  profileImage,
  style
}: AccountPillProps) {
  const Theme = useTheme();

  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-005'],
    Theme['gray-glass-010']
  );

  const backgroundColor = animatedValue;
  const borderColor = Theme['gray-glass-005'];

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor, borderColor }, style]}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      onPress={onPress}
      hitSlop={10}
    >
      <Avatar imageSrc={profileImage} address={address} size={28} borderWidth={0} />
      <Text variant="large-500" color="fg-100" style={styles.text}>
        {profileName
          ? UiUtil.getTruncateString({
              string: profileName,
              charsStart: 17,
              charsEnd: 0,
              truncate: 'end'
            })
          : UiUtil.getTruncateString({
              string: address ?? '',
              charsStart: 4,
              charsEnd: 4,
              truncate: 'middle'
            })}
      </Text>
      <Icon name="chevronBottom" size="sm" color="fg-200" style={styles.copyButton} />
    </AnimatedPressable>
  );
}
