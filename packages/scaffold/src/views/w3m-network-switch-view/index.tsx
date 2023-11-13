import { useSnapshot } from 'valtio';
import { useEffect, useState } from 'react';
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  NetworkController,
  RouterController
} from '@web3modal/core-react-native';
import {
  Button,
  FlexView,
  IconBox,
  LoadingHexagon,
  NetworkImage,
  Text
} from '@web3modal/ui-react-native';
import styles from './styles';

export function NetworkSwitchView() {
  const { data } = useSnapshot(RouterController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const [error, setError] = useState<boolean>(false);
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const network = data?.network;
  const wallet = recentWallets?.[0];

  const onSwitchNetwork = async () => {
    try {
      setError(false);
      await NetworkController.switchActiveNetwork(network);
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
    if (caipNetwork?.id === network?.id) {
      RouterController.goBack();
    }
  }, [caipNetwork?.id, network?.id]);

  const retryTemplate = () => {
    if (!showRetry) return null;

    return (
      <Button
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
          imageSrc={AssetUtil.getNetworkImage(network)}
          imageHeaders={ApiController._getApiHeaders()}
          size="lg"
        />
        {error && (
          <IconBox
            icon="close"
            border
            background
            backgroundColor="icon-box-bg-error-100"
            size="sm"
            iconColor="error-100"
            style={styles.errorIcon}
          />
        )}
      </LoadingHexagon>
      {textTemplate()}
      {retryTemplate()}
    </FlexView>
  );
}
