import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Avatar } from '../wui-avatar';
import { UiUtil } from '../../utils/UiUtil';
import { IconLink } from '../wui-icon-link';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import styles from './styles';

export interface AccountPillProps {
  onPress: () => void;
  onCopy: (address: string) => void;
  address?: string;
  profileName?: string;
  profileImage?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AccountPill({
  onPress,
  onCopy,
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

  const handleCopyAddress = () => {
    if (address) {
      onCopy(address);
    }
  };

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor, borderColor }, style]}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      onPress={onPress}
      hitSlop={10}
    >
      <Avatar imageSrc={profileImage} address={profileName ?? address} size={28} borderWidth={0} />
      <Text variant="large-500" color="fg-100" style={styles.text}>
        {profileName
          ? UiUtil.getTruncateString({
              string: profileName,
              charsStart: 20,
              charsEnd: 0,
              truncate: 'end'
            })
          : UiUtil.getTruncateString({
              string: address ?? '',
              charsStart: 3,
              charsEnd: 3,
              truncate: 'middle'
            })}
      </Text>
      <IconLink icon="copy" size="sm" iconColor="fg-200" onPress={handleCopyAddress} />
    </AnimatedPressable>
  );
}
