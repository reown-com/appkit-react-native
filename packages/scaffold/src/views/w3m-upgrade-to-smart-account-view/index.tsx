import { Linking } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSnapshot } from 'valtio';
import { Button, FlexView, Icon, Link, Text, Visual } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ConnectorController,
  EventsController,
  ModalController,
  NetworkController,
  RouterController,
  SnackController,
  type AppKitFrameProvider
} from '@reown/appkit-core-react-native';
import styles from './styles';

export function UpgradeToSmartAccountView() {
  const { loading } = useSnapshot(ModalController.state);

  const onSwitchAccountType = async () => {
    try {
      ModalController.setLoading(true);
      const accountType =
        AccountController.state.preferredAccountType === 'eoa' ? 'smartAccount' : 'eoa';
      const provider = ConnectorController.getAuthConnector()?.provider as AppKitFrameProvider;
      await provider?.setPreferredAccount(accountType);
      EventsController.sendEvent({
        type: 'track',
        event: 'SET_PREFERRED_ACCOUNT_TYPE',
        properties: {
          accountType,
          network: NetworkController.state.caipNetwork?.id || ''
        }
      });
      RouterController.goBack();
    } catch (error) {
      ModalController.setLoading(false);
      SnackController.showError('Error switching account type');
    }
  };

  const onLearnMorePress = () => {
    Linking.openURL('https://reown.com/faq');
  };

  return (
    <>
      <Icon name="close" onPress={RouterController.goBack} style={styles.closeButton} />
      <BottomSheetView>
        <FlexView style={styles.container} padding={['4xl', 'm', '2xl', 'm']}>
          <FlexView alignItems="center" justifyContent="center" flexDirection="row">
            <Visual name="google" />
            <Visual style={styles.middleIcon} name="pencil" />
            <Visual name="lightbulb" />
          </FlexView>
          <Text variant="medium-600" color="fg-100" style={styles.title}>
            Discover Smart Accounts
          </Text>
          <Text variant="paragraph-400" color="fg-100" center>
            Access advanced brand new features as username, improved security and a smoother user
            experience!
          </Text>
          <FlexView flexDirection="row" margin={['m', '4xl', 'm', '4xl']}>
            <Button
              variant="accent"
              onPress={RouterController.goBack}
              style={[styles.button, styles.cancelButton]}
            >
              Do it later
            </Button>
            <Button onPress={onSwitchAccountType} loading={loading} style={styles.button}>
              Continue
            </Button>
          </FlexView>
          <Link onPress={onLearnMorePress} iconRight="externalLink">
            Learn more
          </Link>
        </FlexView>
      </BottomSheetView>
    </>
  );
}
