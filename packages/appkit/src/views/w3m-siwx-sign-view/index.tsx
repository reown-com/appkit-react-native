import { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  Avatar,
  Button,
  DoubleImageLoader,
  FlexView,
  Text,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import {
  ConnectionsController,
  LogController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-core-react-native';

import { useInternalAppKit } from '../../AppKitContext';
import { SIWXUtil } from '../../utils/SIWXUtil';
import styles from './styles';

export function SIWXSignMessageView() {
  const { disconnect } = useInternalAppKit();
  const { padding } = useCustomDimensions();
  const { metadata } = useSnapshot(OptionsController.state);
  const { activeAddress, identity, walletInfo } = useSnapshot(ConnectionsController.state);
  const [isSigning, setIsSigning] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const dappName = metadata?.name || 'Dapp';
  const dappIcon = metadata?.icons[0] || '';
  const walletIcon = walletInfo?.icon;

  const onSign = async () => {
    setIsSigning(true);
    try {
      await SIWXUtil.requestSignMessage();
    } catch (error) {
      LogController.sendError(error, 'SIWXSignMessageView.tsx', 'onSign');
      SnackController.showError('Signature declined');
    } finally {
      setIsSigning(false);
    }
  };

  const onCancel = async () => {
    if (ConnectionsController.state.activeAddress) {
      setIsDisconnecting(true);
      await SIWXUtil.cancelSignMessage(disconnect);
      setIsDisconnecting(false);
    } else {
      RouterController.push('Connect');
    }
  };

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
      <FlexView padding={['0', 's', 's', 's']}>
        <DoubleImageLoader
          style={styles.logoContainer}
          leftImage={dappIcon}
          rightImage={walletIcon}
          renderRightPlaceholder={() => (
            <Avatar imageSrc={identity?.avatar} address={activeAddress} size={60} borderWidth={0} />
          )}
          rightItemStyle={!walletIcon && styles.walletAvatar}
        />
        <Text center variant="medium-600" color="fg-100" style={styles.title}>
          {dappName} needs to connect to your wallet
        </Text>
        <Text center variant="small-400" color="fg-200" style={styles.subtitle}>
          Sign this message to prove you own this wallet and proceed. Cancelling will disconnect you
        </Text>
        <FlexView flexDirection="row" justifyContent="space-between" margin={['s', '0', '0', '0']}>
          <Button
            variant="shade"
            onPress={onCancel}
            style={styles.button}
            loading={isDisconnecting}
          >
            Cancel
          </Button>
          <Button
            variant="fill"
            loading={isSigning}
            disabled={isDisconnecting}
            onPress={onSign}
            style={styles.button}
          >
            Sign
          </Button>
        </FlexView>
      </FlexView>
    </ScrollView>
  );
}
