import { Linking } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useState } from 'react';
import { Button, FlexView, Icon, Link, Text, Visual } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ConnectionController,
  EventsController,
  NetworkController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';
import styles from './styles';

export function UpgradeToSmartAccountView() {
  const [isAccountTypeLoading, setIsAccountTypeLoading] = useState(false);

  const onSwitchAccountType = async () => {
    try {
      setIsAccountTypeLoading(true);
      const accountType =
        AccountController.state.preferredAccountType === 'eoa' ? 'smartAccount' : 'eoa';
      await ConnectionController.setPreferredAccountType(accountType);
      EventsController.sendEvent({
        type: 'track',
        event: 'SET_PREFERRED_ACCOUNT_TYPE',
        properties: {
          accountType,
          network: NetworkController.state.caipNetwork?.id || ''
        }
      });
      setIsAccountTypeLoading(false);
      RouterController.goBack();
    } catch (error) {
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
            <Button
              onPress={onSwitchAccountType}
              loading={isAccountTypeLoading}
              style={styles.button}
            >
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
