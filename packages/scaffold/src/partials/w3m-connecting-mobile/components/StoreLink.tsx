import { ActionEntry, Button, Spacing, Text } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export interface StoreLinkProps {
  visible: boolean;
  walletName?: string;
  onPress: () => void;
}

export function StoreLink({ visible, walletName = 'Wallet', onPress }: StoreLinkProps) {
  if (!visible) return null;

  return (
    <ActionEntry style={styles.storeButton}>
      <Text numberOfLines={1} variant="paragraph-500" color="fg-200">
        {`Don't have ${walletName}?`}
      </Text>
      <Button
        variant="accent"
        iconRight="chevronRightSmall"
        onPress={onPress}
        size="sm"
        hitSlop={20}
      >
        Get
      </Button>
    </ActionEntry>
  );
}

const styles = StyleSheet.create({
  storeButton: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.l
  }
});
