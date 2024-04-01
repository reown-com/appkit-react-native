import { StyleSheet } from 'react-native';
import { Chip, FlexView, Spacing, Text } from '@web3modal/ui-react-native';
import { W3mFrameConstants } from '@web3modal/email-react-native';

export function UpgradeEmailWalletView() {
  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center">
      <Text variant="paragraph-400">Follow the instructions on</Text>
      <Chip
        label="secure.walletconnect.com"
        icon="externalLink"
        imageSrc={W3mFrameConstants.SECURE_SITE_ICON}
        link={W3mFrameConstants.SECURE_SITE_DASHBOARD}
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
