import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import {
  AccountController,
  ConnectorController,
  OnRampController,
  RouterController
} from '@reown/appkit-core-react-native';
import { StringUtil } from '@reown/appkit-common-react-native';
import { Button, FlexView, IconBox, Image, Text, useTheme } from '@reown/appkit-ui-react-native';
import styles from './styles';

export function OnRampTransactionView() {
  const Theme = useTheme();
  const { data } = useSnapshot(RouterController.state);

  const onClose = () => {
    const isAuth = ConnectorController.state.connectedConnector === 'AUTH';
    RouterController.replace(isAuth ? 'Account' : 'AccountDefault');
  };

  const showNetwork = !!data?.onrampResult?.network;
  const showStatus = !!data?.onrampResult?.status;

  useEffect(() => {
    return () => {
      OnRampController.resetState();
      AccountController.fetchTokenBalance();
    };
  }, []);

  return (
    <FlexView padding={['xl', 'l', '4xl', 'l']}>
      <FlexView>
        <FlexView alignItems="center">
          <IconBox
            icon="checkmark"
            size="xl"
            iconColor="success-100"
            background
            backgroundColor="success-glass-020"
            style={styles.icon}
          />
          <Text variant="medium-600" color="fg-100">
            You successfully bought {data?.onrampResult?.purchaseCurrency}
          </Text>
        </FlexView>
        <FlexView
          style={[styles.card, { backgroundColor: Theme['gray-glass-005'] }]}
          padding="m"
          margin={['s', '0', '2xl', '0']}
        >
          <FlexView
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            margin={['0', '0', 'xs', '0']}
          >
            <Text variant="paragraph-400" color="fg-150">
              You Paid
            </Text>
            <Text variant="paragraph-500">
              {data?.onrampResult?.paymentAmount} {data?.onrampResult?.paymentCurrency}
            </Text>
          </FlexView>
          <FlexView
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            margin={['0', '0', 'xs', '0']}
          >
            <Text variant="paragraph-400" color="fg-150">
              You Bought
            </Text>
            <FlexView flexDirection="row" alignItems="center">
              <Text variant="paragraph-500">
                {data?.onrampResult?.purchaseAmount} {data?.onrampResult?.purchaseCurrency}
              </Text>
              {data?.onrampResult?.purchaseImageUrl && (
                <Image
                  source={data?.onrampResult?.purchaseImageUrl}
                  style={[styles.tokenImage, { borderColor: Theme['gray-glass-010'] }]}
                />
              )}
            </FlexView>
          </FlexView>
          {showNetwork && (
            <FlexView
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              margin={['0', '0', 'xs', '0']}
            >
              <Text variant="paragraph-400" color="fg-150">
                Network
              </Text>
              <Text variant="paragraph-500">
                {StringUtil.capitalize(data?.onrampResult?.network)}
              </Text>
            </FlexView>
          )}
          {showStatus && (
            <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
              <Text variant="paragraph-400" color="fg-150">
                Status
              </Text>
              <Text variant="paragraph-500">
                {StringUtil.capitalize(data?.onrampResult?.status)}
              </Text>
            </FlexView>
          )}
        </FlexView>
      </FlexView>
      <Button variant="fill" size="md" onPress={onClose}>
        Close
      </Button>
    </FlexView>
  );
}
