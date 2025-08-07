import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  RouterController,
  ApiController,
  EventsController,
  WcController,
  AssetUtil
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
import { useInternalAppKit } from '../../AppKitContext';
import { ConstantsUtil } from '@reown/appkit-common-react-native';

export function ConnectingExternalView() {
  const { data } = useSnapshot(RouterController.state);
  const { connect } = useInternalAppKit();
  const { maxWidth: width } = useCustomDimensions();
  const [errorType, setErrorType] = useState<BodyErrorType>();
  const bodyMessage = getMessage({ walletName: data?.wallet?.name, errorType });

  const onRetryPress = () => {
    setErrorType(undefined);
    onConnect();
  };

  const onConnect = useCallback(async () => {
    try {
      const wallet = RouterController.state.data?.wallet;
      if (wallet) {
        if (wallet.id === ConstantsUtil.PHANTOM_CUSTOM_WALLET.id) {
          await connect('phantom');
        } else if (wallet.id === ConstantsUtil.COINBASE_CUSTOM_WALLET.id) {
          await connect('coinbase');
        } else if (wallet.id === ConstantsUtil.UNISAT_CUSTOM_WALLET.id) {
          await connect('unisat');
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
            imageSrc={AssetUtil.getWalletImage(data?.wallet)}
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
    </ScrollView>
  );
}
