import { Animated, Pressable, View } from 'react-native';
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
  isProfileName?: boolean;
  balance?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function AccountButton({
  networkSrc,
  imageHeaders,
  avatarSrc,
  address,
  isProfileName,
  balance,
  onPress,
  disabled
}: AccountButtonProps) {
  const Theme = useTheme();
  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['overlay-002'],
    Theme['overlay-010']
  );

  function balanceTemplate() {
    if (balance) {
      const network = networkSrc ? (
        <Image
          source={networkSrc}
          headers={imageHeaders}
          style={[styles.image, { borderColor: Theme['overlay-010'] }]}
        />
      ) : (
        <IconBox
          icon="networkPlaceholder"
          size="sm"
          iconColor="fg-200"
          background
          border
          style={{ borderColor: Theme['overlay-010'] }}
        />
      );

      return (
        <View style={styles.networkContainer}>
          {network}
          <Text variant="paragraph-600" color="fg-100">
            {balance}
          </Text>
        </View>
      );
    }

    return null;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      disabled={disabled}
      style={[
        styles.container,
        { backgroundColor: animatedValue, borderColor: Theme['overlay-005'] }
      ]}
    >
      {balanceTemplate()}
      <View
        style={[
          styles.addressContainer,
          { backgroundColor: Theme['overlay-010'], borderColor: Theme['overlay-005'] }
        ]}
      >
        <Avatar
          imageSrc={avatarSrc}
          address={address}
          style={[styles.image, !avatarSrc && styles.avatarPlaceholder]}
        />
        {address && (
          <Text variant="paragraph-600" color="fg-200" style={styles.address}>
            {UiUtil.getTruncateString(
              address,
              isProfileName ? 18 : 4,
              isProfileName ? 0 : 6,
              isProfileName ? 'end' : 'middle'
            )}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}
