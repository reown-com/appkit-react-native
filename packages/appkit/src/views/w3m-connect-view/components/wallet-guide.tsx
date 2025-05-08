import { RouterController } from '@reown/appkit-core-react-native';
import { Chip, FlexView, Link, Separator, Spacing, Text } from '@reown/appkit-ui-react-native';
import { Linking, StyleSheet } from 'react-native';

export interface WalletGuideProps {
  guide: 'explore' | 'get-started';
}

export function WalletGuide({ guide }: WalletGuideProps) {
  const onExplorerPress = () => {
    Linking.openURL('https://explorer.walletconnect.com');
  };

  const onGetStartedPress = () => {
    RouterController.push('Create');
  };

  return guide === 'explore' ? (
    <FlexView alignItems="center" justifyContent="center">
      <Separator text="or" style={styles.socialSeparator} />
      <Text variant="small-400" style={styles.text}>
        Looking for a self-custody wallet?
      </Text>
      <Chip
        label="Visit our explorer"
        variant="transparent"
        rightIcon="externalLink"
        leftIcon="walletConnectLightBrown"
        size="sm"
        onPress={onExplorerPress}
      />
    </FlexView>
  ) : (
    <FlexView alignItems="center" justifyContent="center" margin="m" flexDirection="row">
      <Text variant="small-400">Haven't got a wallet?</Text>
      <Link onPress={onGetStartedPress} size="sm">
        Get started
      </Link>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  text: {
    marginBottom: Spacing.xs
  },
  socialSeparator: {
    marginVertical: Spacing.l
  }
});
