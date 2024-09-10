import { useSnapshot } from 'valtio';
import { StyleSheet } from 'react-native';
import { Chip, FlexView, Spacing, Text } from '@reown/ui-react-native';
import { ConnectorController, type W3mFrameProvider } from '@reown/core-react-native';

export function UpgradeEmailWalletView() {
  const { connectors } = useSnapshot(ConnectorController.state);
  const emailProvider = connectors.find(c => c.type === 'EMAIL')?.provider as W3mFrameProvider;

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center">
      <Text variant="paragraph-400">Follow the instructions on</Text>
      <Chip
        label="secure.walletconnect.com"
        icon="externalLink"
        imageSrc={emailProvider.getSecureSiteIconURL()}
        link={emailProvider.getSecureSiteDashboardURL()}
        style={styles.chip}
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
