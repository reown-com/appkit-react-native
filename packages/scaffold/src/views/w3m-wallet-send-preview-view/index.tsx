import { useSnapshot } from 'valtio';
import { Avatar, Button, FlexView, Icon, Image, Text, UiUtil } from '@reown/appkit-ui-react-native';
import { NumberUtil } from '@reown/appkit-common-react-native';
import {
  NetworkController,
  RouterController,
  SendController
} from '@reown/appkit-core-react-native';
import { PreviewSendPill } from './components/preview-send-pill';
import styles from './styles';
import { PreviewSendDetails } from './components/preview-send-details';

export function WalletSendPreviewView() {
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { token, receiverAddress, gasPriceInUSD, loading } = useSnapshot(SendController.state);

  const getSendValue = () => {
    if (SendController.state.token && SendController.state.sendTokenAmount) {
      const price = SendController.state.token.price;
      const totalValue = price * SendController.state.sendTokenAmount;

      return totalValue.toFixed(2);
    }

    return null;
  };

  const getTokenAmount = () => {
    const value = SendController.state.sendTokenAmount
      ? NumberUtil.roundNumber(SendController.state.sendTokenAmount, 6, 5)
      : 'unknown';

    return `${value} ${SendController.state.token?.symbol}`;
  };

  const formattedAddress = UiUtil.getTruncateString({
    string: receiverAddress ? receiverAddress : '',
    charsStart: 4,
    charsEnd: 4,
    truncate: 'middle'
  });

  const onSend = () => {
    SendController.sendToken();
  };

  return (
    <FlexView padding={['l', 'xl', '3xl', 'xl']}>
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
        <FlexView>
          <Text variant="small-400" color="fg-150">
            Send
          </Text>
          <Text variant="paragraph-400" color="fg-100">
            ${getSendValue()}
          </Text>
        </FlexView>
        <PreviewSendPill text={getTokenAmount()}>
          {token?.iconUrl ? (
            <Image source={token?.iconUrl} style={styles.tokenLogo} />
          ) : (
            <Icon
              name="coinPlaceholder"
              height={32}
              width={32}
              style={styles.tokenLogo}
              color="fg-200"
            />
          )}
        </PreviewSendPill>
      </FlexView>
      <Icon name="arrowBottom" height={14} width={14} color="fg-200" style={styles.arrow} />
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between">
        <Text variant="small-400" color="fg-150">
          To
        </Text>
        <PreviewSendPill text={formattedAddress}>
          <Avatar address={receiverAddress} size={32} borderWidth={0} style={styles.avatar} />
        </PreviewSendPill>
      </FlexView>
      <PreviewSendDetails
        style={styles.details}
        networkFee={gasPriceInUSD}
        address={receiverAddress}
        caipNetwork={caipNetwork}
      />
      <FlexView flexDirection="row" alignItems="center" justifyContent="center">
        <Icon name="warningCircle" size="sm" color="fg-200" style={styles.reviewIcon} />
        <Text variant="small-400" color="fg-200">
          Review transaction carefully
        </Text>
      </FlexView>
      <FlexView flexDirection="row" margin={['l', '0', '0', '0']}>
        <Button variant="shade" style={styles.cancelButton} onPress={RouterController.goBack}>
          Cancel
        </Button>
        <Button variant="fill" style={styles.sendButton} onPress={onSend} loading={loading}>
          Send
        </Button>
      </FlexView>
    </FlexView>
  );
}
