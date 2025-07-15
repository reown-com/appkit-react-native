import { Linking, StyleSheet } from 'react-native';
import { Chip, FlexView, Spacing, Text } from '@reown/appkit-ui-react-native';
import { ConstantsUtil } from '@reown/appkit-common-react-native';

export function UpgradeEmailWalletView() {
  const onLinkPress = () => {
    const link = ConstantsUtil.SECURE_SITE_DASHBOARD;
    Linking.canOpenURL(link).then(supported => {
      if (supported) Linking.openURL(link);
    });
  };

  return (
    <FlexView padding={['l', 'l', '3xl', 'l']} alignItems="center">
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
