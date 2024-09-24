import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import { UiUtil } from '../../utils/UiUtil';
import { Avatar } from '../wui-avatar';
import { IconBox } from '../wui-icon-box';
import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AccountButtonProps {
  networkSrc?: string;
  imageHeaders?: Record<string, string>;
  avatarSrc?: string;
  address?: string;
  profileName?: string;
  balance?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AccountButton({
  networkSrc,
  imageHeaders,
  avatarSrc,
  address,
  profileName,
  balance,
  onPress,
  disabled,
  style,
  testID
}: AccountButtonProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-002'],
    Theme['gray-glass-010']
  );

  function balanceTemplate() {
    if (balance) {
      const network = networkSrc ? (
        <Image
          source={networkSrc}
          headers={imageHeaders}
          style={[styles.image, { borderColor: Theme['gray-glass-005'] }]}
        />
      ) : (
        <IconBox
          icon="networkPlaceholder"
          size="sm"
          iconColor="fg-200"
          background
          border
          style={{ borderColor: Theme['gray-glass-005'] }}
        />
      );

      return (
        <View style={styles.networkContainer}>
          {network}
          <Text variant="paragraph-600" color="fg-100" style={styles.balance}>
            {balance}
          </Text>
        </View>
      );
    }

    return null;
  }

  const formattedAddress = profileName
    ? UiUtil.getTruncateString({
        string: profileName,
        charsStart: 18,
        charsEnd: 0,
        truncate: 'end'
      })
    : UiUtil.getTruncateString({
        string: address || '',
        charsStart: 4,
        charsEnd: 6,
        truncate: 'middle'
      });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      disabled={disabled}
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: animatedValue, borderColor: Theme['gray-glass-005'] },
        style
      ]}
    >
      {balanceTemplate()}
      <View
        style={[
          styles.addressContainer,
          { backgroundColor: Theme['gray-glass-005'], borderColor: Theme['gray-glass-005'] }
        ]}
      >
        <Avatar
          imageSrc={avatarSrc}
          address={address}
          size={20}
          borderWidth={2}
          style={[styles.image, !avatarSrc && styles.avatarPlaceholder]}
        />
        {address && (
          <Text variant="paragraph-500" color="fg-200" style={styles.address}>
            {formattedAddress}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}
