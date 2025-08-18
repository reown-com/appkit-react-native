import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  EventsController,
  WcController,
  AssetUtil,
  AssetController,
  CoreHelperUtil
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingThumbnail,
  WalletImage,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';

import { ConnectingBody, getMessage, type BodyErrorType } from '../../partials/w3m-connecting-body';
import styles from './styles';
import { useInternalAppKit } from '../../AppKitContext';
import { StoreLink } from '../../partials/w3m-connecting-mobile/components/StoreLink';
import { WcHelpersUtil } from '../../utils/HelpersUtil';

export function ConnectingExternalView() {
  const { data } = useSnapshot(RouterController.state);
  const { walletImages } = useSnapshot(AssetController.state);
  const { connect } = useInternalAppKit();
  const { maxWidth: width } = useCustomDimensions();
  const [errorType, setErrorType] = useState<BodyErrorType>();
  const bodyMessage = getMessage({ walletName: data?.wallet?.name, errorType });

  const storeUrl = Platform.select({
    ios: data?.wallet?.app_store,
    android: data?.wallet?.play_store
  });

  const onStorePress = () => {
    if (storeUrl) {
      CoreHelperUtil.openLink(storeUrl);
    }
  };

  const onRetryPress = () => {
    setErrorType(undefined);
    onConnect();
  };

  const onConnect = useCallback(async () => {
    try {
      const wallet = RouterController.state.data?.wallet;
      if (wallet) {
        if (WcHelpersUtil.isExternalWallet(wallet)) {
          await connect({ wallet });
        } else {
          // All other wallets are handled by WalletConnect connector
          return;
        }
        WcController.addRecentWallet(wallet);
        WcController.setPressedWallet(wallet);
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: {
            name: wallet?.name ?? 'Unknown',
            method: 'mobile',
            explorer_id: wallet?.id
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
  }, [connect]);

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
            imageSrc={AssetUtil.getWalletImage(data?.wallet, walletImages)}
            imageHeaders={ApiController._getApiHeaders()}
          />
          {errorType ? (
            <IconBox
              icon={'close'}
              border
              background
              backgroundColor="icon-box-bg-error-100"
              size="sm"
              iconColor="error-100"
              style={styles.errorIcon}
            />
          ) : null}
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
      <StoreLink visible={!!storeUrl} walletName={data?.wallet?.name} onPress={onStorePress} />
    </ScrollView>
  );
}
