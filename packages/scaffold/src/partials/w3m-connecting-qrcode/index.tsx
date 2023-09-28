import { ConnectionController } from '@web3modal/core-react-native';
import { FlexView, Link, LoadingSpinner, QrCode, Text } from '@web3modal/ui-react-native';
import { useSnapshot } from 'valtio';

export function ConnectingQrCode() {
  const { wcUri } = useSnapshot(ConnectionController.state);
  //TODO: Improve loading

  return (
    <FlexView alignItems="center" gap="m" padding="m">
      {wcUri ? (
        <>
          <QrCode size={300} uri={wcUri} />
          <Text variant="paragraph-500">Scan this QR code with your phone</Text>
          <Link iconLeft="copy" color="fg-200" onPress={() => {}}>
            Copy link
          </Link>
        </>
      ) : (
        <LoadingSpinner />
      )}
    </FlexView>
  );
}
