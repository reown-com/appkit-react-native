import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useState } from 'react';
import {
  ApiController,
  AssetController,
  AssetUtil,
  RouterController
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingHexagon,
  NetworkImage,
  Text,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import { useInternalAppKit } from '../../AppKitContext';
import styles from './styles';
import { ScrollView } from 'react-native';

export function NetworkSwitchView() {
  const { switchNetwork, back } = useInternalAppKit();
  const { padding } = useCustomDimensions();
  const { data } = useSnapshot(RouterController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const networkImage = AssetUtil.getNetworkImage(data?.network, networkImages);

  const onSwitchNetwork = useCallback(async () => {
    try {
      if (!RouterController.state.data?.network) return;
      setIsError(false);
      await switchNetwork(RouterController.state.data.network);
      back();
    } catch (error) {
      setIsError(true);
      setShowRetry(true);
    }
  }, [switchNetwork, back]);

  useEffect(() => {
    onSwitchNetwork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
      <FlexView alignItems="center" padding={['xl', 's', 's', 's']}>
        <LoadingHexagon paused={isError}>
          <NetworkImage
            imageSrc={networkImage}
            imageHeaders={ApiController._getApiHeaders()}
            size="lg"
          />
          {isError ? (
            <IconBox
              icon="close"
              border
              background
              backgroundColor="icon-box-bg-error-100"
              size="sm"
              iconColor="error-100"
              style={styles.errorIcon}
            />
          ) : null}
        </LoadingHexagon>
        {isError ? (
          <>
            <Text variant="paragraph-500" style={styles.text}>
              Switch declined
            </Text>
            <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
              Switch can be declined if chain is not supported by a wallet or previous request is
              still active
            </Text>
          </>
        ) : (
          <>
            <Text variant="paragraph-500" style={styles.text}>
              Approve in your wallet
            </Text>
            <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
              Accept the switch request in your wallet
            </Text>
          </>
        )}
        {showRetry ? (
          <Button
            size="sm"
            variant="accent"
            iconLeft="refresh"
            style={styles.retryButton}
            iconStyle={styles.retryIcon}
            onPress={onSwitchNetwork}
          >
            Try again
          </Button>
        ) : null}
      </FlexView>
    </ScrollView>
  );
}
