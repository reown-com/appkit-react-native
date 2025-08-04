import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import {
  ApiController,
  AssetController,
  WcController,
  ConnectionsController,
  RouterController,
  RouterUtil,
  AssetUtil
} from '@reown/appkit-core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingHexagon,
  NetworkImage,
  Text
} from '@reown/appkit-ui-react-native';
import { useInternalAppKit } from '../../AppKitContext';
import styles from './styles';

//TODO: is this used?
export function NetworkSwitchView() {
  const { switchNetwork } = useInternalAppKit();
  const { data } = useSnapshot(RouterController.state);
  const { recentWallets } = useSnapshot(WcController.state);
  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const [error, setError] = useState<boolean>(false);
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const network = data?.network;
  const wallet = recentWallets?.[0];
  const networkImage = AssetUtil.getNetworkImage(network, networkImages);

  const onSwitchNetwork = async () => {
    try {
      if (network) {
        setError(false);
        const _network = ConnectionsController.state.networks.find(n => n.id === network.id);
        if (!_network) return;
        await switchNetwork(_network);
      }
    } catch {
      setError(true);
      setShowRetry(true);
    }
  };

  useEffect(() => {
    onSwitchNetwork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Go back if network is already switched
    // eslint-disable-next-line valtio/state-snapshot-rule
    if (activeNetwork?.id === network?.id) {
      RouterUtil.navigateAfterNetworkSwitch();
    }

    // eslint-disable-next-line valtio/state-snapshot-rule
  }, [activeNetwork?.id, network?.id]);

  const retryTemplate = () => {
    if (!showRetry) return null;

    return (
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
    );
  };

  const textTemplate = () => {
    const walletName = wallet?.name ?? 'wallet';
    if (error) {
      return (
        <>
          <Text variant="paragraph-500" style={styles.text}>
            Switch declined
          </Text>
          <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
            Switch can be declined if chain is not supported by a wallet or previous request is
            still active
          </Text>
        </>
      );
    }

    return (
      <>
        <Text variant="paragraph-500" style={styles.text}>{`Approve in ${walletName}`}</Text>
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          Accept switch request in your wallet
        </Text>
      </>
    );
  };

  return (
    <FlexView alignItems="center" padding={['2xl', 's', '4xl', 's']}>
      <LoadingHexagon paused={error}>
        <NetworkImage
          imageSrc={networkImage}
          imageHeaders={ApiController._getApiHeaders()}
          size="lg"
        />
        {error ? <IconBox
            icon="close"
            border
            background
            backgroundColor="icon-box-bg-error-100"
            size="sm"
            iconColor="error-100"
            style={styles.errorIcon}
          /> : null}
      </LoadingHexagon>
      {textTemplate()}
      {retryTemplate()}
    </FlexView>
  );
}
