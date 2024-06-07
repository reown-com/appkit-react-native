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
import { Button, FlexView, LoadingThumbnail, Text, WalletImage } from '@web3modal/ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectingExternalView() {
  const { data } = useSnapshot(RouterController.state);
  const connector = data?.connector;
  const { maxWidth: width } = useCustomDimensions();
  const [connectionError, setConnectionError] = useState(false);
  const [installedError, setInstalledError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [ready, setReady] = useState(false);

  const onRetryPress = () => {
    setIsRetrying(true);
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
        setConnectionError(false);
        setInstalledError(false);
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
        setConnectionError(false);
      } else {
        setConnectionError(true);
        setInstalledError(false);
      }
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: (error as Error)?.message ?? 'Unknown' }
      });
    }
  }, [connector, storeConnectedWallet, data?.wallet]);

  const textTemplate = () => {
    const connectorName = data?.connector?.name ?? 'Wallet';
    if (connectionError) {
      return (
        <FlexView
          padding={['3xs', '2xl', '0', '2xl']}
          alignItems="center"
          style={styles.textContainer}
        >
          <Text variant="paragraph-500" color="error-100">
            Connection error
          </Text>
          <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
            Connection can be declined if a previous request is still active
          </Text>
        </FlexView>
      );
    } else if (installedError) {
      return (
        <FlexView
          padding={['3xs', '2xl', '0', '2xl']}
          alignItems="center"
          style={styles.textContainer}
        >
          <Text variant="paragraph-500">App not installed</Text>
        </FlexView>
      );
    }

    return (
      <FlexView
        padding={['3xs', '2xl', '0', '2xl']}
        alignItems="center"
        style={styles.textContainer}
      >
        <Text variant="paragraph-500">{`Continue in ${connectorName}`}</Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          Accept connection request in the wallet
        </Text>
      </FlexView>
    );
  };

  const retryTemplate = () => {
    if (installedError) return null;

    return (
      <Button
        variant="accent"
        iconLeft="refresh"
        style={styles.retryButton}
        iconStyle={styles.retryIcon}
        onPress={onRetryPress}
      >
        Try again
      </Button>
    );
  };

  useEffect(() => {
    // First connection
    if (!ready) {
      setReady(true);
      onConnect();
    }
  }, [ready, onConnect]);

  useEffect(() => {
    if (isRetrying) {
      setIsRetrying(false);
      onConnect();
    }
  }, [isRetrying, onConnect]);

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
        {textTemplate()}
        {retryTemplate()}
      </FlexView>
    </ScrollView>
  );
}
