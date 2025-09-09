import { StyleSheet } from 'react-native';
import { Chip, FlexView, Spacing, Text } from '@reown/appkit-ui-react-native';
import { ConstantsUtil } from '@reown/appkit-common-react-native';
import { CoreHelperUtil } from '@reown/appkit-core-react-native';

export function UpgradeEmailWalletView() {
  const onLinkPress = () => {
    CoreHelperUtil.openLink(ConstantsUtil.SECURE_SITE_DASHBOARD);
  };

  return (
    <FlexView padding={['l', 'l', 's', 'l']} alignItems="center">
      <Text variant="paragraph-400">Follow the instructions on</Text>
      <Chip
        label="secure.reown.com"
        rightIcon="externalLink"
        imageSrc={ConstantsUtil.SECURE_SITE_ICON}
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
