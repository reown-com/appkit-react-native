import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  AssetUtil,
  ConnectionController,
  ModalController,
  EventsController,
  StorageUtil,
  type WcWallet
} from '@web3modal/core-react-native';
import { Button, FlexView, LoadingThumbnail, WalletImage } from '@web3modal/ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectingBody } from './components/Body';
import styles from './styles';

export function ConnectingExternalView() {
  const { data } = useSnapshot(RouterController.state);
  const connector = data?.connector;
  const { maxWidth: width } = useCustomDimensions();
  const [connectionError, setConnectionError] = useState(false);
  const [installedError, setInstalledError] = useState(false);

  const onRetryPress = () => {
    setConnectionError(false);
    onConnect();
  };

  const storeConnectedWallet = useCallback(
    async (wallet?: WcWallet) => {
      if (wallet) {
        const recentWallets = await StorageUtil.setWeb3ModalRecent(wallet);
        if (recentWallets) {
          ConnectionController.setRecentWallets(recentWallets);
        }
      }
      if (connector) {
        const url = AssetUtil.getConnectorImage(connector);
        ConnectionController.setConnectedWalletImageUrl(url);
      }
    },
    [connector]
  );

  const onConnect = useCallback(async () => {
    try {
      if (connector) {
        await ConnectionController.connectExternal(connector);
        storeConnectedWallet(data?.wallet);
        ModalController.close();
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: { name: data.wallet?.name ?? 'Unknown', method: 'mobile' }
        });
      }
    } catch (error) {
      if (/(Wallet not found)/i.test((error as Error).message)) {
        setInstalledError(true);
      } else {
        setConnectionError(true);
      }
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: (error as Error)?.message ?? 'Unknown' }
      });
    }
  }, [connector, storeConnectedWallet, data?.wallet]);

  useEffect(() => {
    onConnect();
  }, [onConnect]);

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} contentContainerStyle={styles.container}>
      <FlexView
        alignItems="center"
        alignSelf="center"
        padding={['2xl', 'l', '0', 'l']}
        style={{ width }}
      >
        <LoadingThumbnail paused={connectionError || installedError}>
          <WalletImage
            size="xl"
            imageSrc={AssetUtil.getConnectorImage(connector)}
            imageHeaders={ApiController._getApiHeaders()}
          />
        </LoadingThumbnail>
        <ConnectingBody
          connectionError={connectionError}
          installedError={installedError}
          walletName={data?.connector?.name}
        />
        {!installedError && (
          <Button
            size="sm"
            variant="accent"
            iconLeft="refresh"
            style={styles.retryButton}
            iconStyle={styles.retryIcon}
            onPress={onRetryPress}
          >
            Try again
          </Button>
        )}
      </FlexView>
    </ScrollView>
  );
}
