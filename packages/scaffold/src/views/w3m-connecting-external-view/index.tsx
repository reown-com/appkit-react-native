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
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingThumbnail,
  WalletImage
} from '@reown/appkit-ui-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectingBody, getMessage, type BodyErrorType } from '../../partials/w3m-connecting-body';
import styles from './styles';

export function ConnectingExternalView() {
  const { data } = RouterController.state;
  const connector = data?.connector;
  const { maxWidth: width } = useCustomDimensions();
  const [errorType, setErrorType] = useState<BodyErrorType>();
  const bodyMessage = getMessage({ walletName: data?.wallet?.name, errorType });

  const onRetryPress = () => {
    setErrorType(undefined);
    onConnect();
  };

  const storeConnectedWallet = useCallback(
    async (wallet?: WcWallet) => {
      if (wallet) {
        const recentWallets = await StorageUtil.addRecentWallet(wallet);
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
          properties: {
            name: data.wallet?.name ?? 'Unknown',
            method: 'mobile',
            explorer_id: data.wallet?.id
          }
        });
      }
    } catch (error) {
      if (/(Wallet not found)/i.test((error as Error).message)) {
        setErrorType('not_installed');
      } else if (/(rejected)/i.test((error as Error).message)) {
        setErrorType('declined');
      } else {
        setErrorType('default');
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
        <LoadingThumbnail paused={!!errorType}>
          <WalletImage
            size="xl"
            imageSrc={AssetUtil.getConnectorImage(connector)}
            imageHeaders={ApiController._getApiHeaders()}
          />
          {errorType && (
            <IconBox
              icon={'close'}
              border
              background
              backgroundColor="icon-box-bg-error-100"
              size="sm"
              iconColor="error-100"
              style={styles.errorIcon}
            />
          )}
        </LoadingThumbnail>
        <ConnectingBody title={bodyMessage.title} description={bodyMessage.description} />
        {errorType !== 'not_installed' && (
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
