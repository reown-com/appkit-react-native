import { useSnapshot } from 'valtio';
import { Linking, StyleSheet } from 'react-native';
import { Chip, FlexView, Spacing, Text } from '@reown/appkit-ui-react-native';
import { ConnectorController, type AppKitFrameProvider } from '@reown/appkit-core-react-native';

export function UpgradeEmailWalletView() {
  const { connectors } = useSnapshot(ConnectorController.state);
  const authProvider = connectors.find(c => c.type === 'AUTH')?.provider as AppKitFrameProvider;

  const onLinkPress = () => {
    const link = authProvider.getSecureSiteDashboardURL();
    Linking.canOpenURL(link).then(supported => {
      if (supported) Linking.openURL(link);
    });
  };

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center">
      <Text variant="paragraph-400">Follow the instructions on</Text>
      <Chip
        label="secure.walletconnect.com"
        icon="externalLink"
        imageSrc={authProvider.getSecureSiteIconURL()}
        style={styles.chip}
        onPress={onLinkPress}
      />
      <Text variant="small-400" color="fg-200">
        You will have to reconnect for security reasons
      </Text>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginVertical: Spacing.m
  }
});
