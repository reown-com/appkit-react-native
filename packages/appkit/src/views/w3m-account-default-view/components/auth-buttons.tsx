import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { UpgradeWalletButton } from './upgrade-wallet-button';
import { ListItem, ListSocial, Spacing, Text } from '@reown/appkit-ui-react-native';
import type { SocialProvider } from '@reown/appkit-common-react-native';

export interface AuthButtonsProps {
  onUpgradePress: () => void;
  onPress: () => void;
  socialProvider?: SocialProvider;
  text: string;
  style?: StyleProp<ViewStyle>;
}

export function AuthButtons({
  onUpgradePress,
  onPress,
  socialProvider,
  text,
  style
}: AuthButtonsProps) {
  return (
    <>
      <UpgradeWalletButton onPress={onUpgradePress} style={styles.upgradeButton} />
      {socialProvider ? (
        <ListSocial
          logo={socialProvider}
          logoHeight={32}
          logoWidth={32}
          style={[styles.socialContainer, style]}
        >
          <Text color="fg-100" numberOfLines={1} ellipsizeMode="tail" style={styles.socialText}>
            {text}
          </Text>
        </ListSocial>
      ) : (
        <ListItem
          icon="email"
          onPress={onPress}
          chevron
          testID="button-email"
          iconColor="fg-100"
          style={style}
        >
          <Text color="fg-100" numberOfLines={1} ellipsizeMode="tail">
            {text}
          </Text>
        </ListItem>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    marginBottom: Spacing.xs
  },
  upgradeButton: {
    marginBottom: Spacing.s
  },
  socialContainer: {
    justifyContent: 'flex-start',
    width: '100%'
  },
  socialText: {
    flex: 1,
    marginLeft: Spacing.s
  }
});
