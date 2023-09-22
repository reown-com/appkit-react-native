import { ActionEntry, FlexView, QrCode, Text } from '@web3modal/ui-react-native';

export function ConnectingQrCode() {
  //TODO: Replace with real URI

  return (
    <FlexView alignItems="center" gap="m" padding="m">
      <QrCode
        size={300}
        uri="wc:test:5ec7834c72432d7f4e0f874a5c481958e816af1bb403ef2eb@2?relay-protocol=irn&symKey=1476bedddda59a5565d78f625f2c3a02e910fed902fa18ec77a187testtest"
      />
      <Text variant="paragraph-500">Scan this QR code with your phone</Text>
      <ActionEntry label="Copy link" iconLeft="copy" onPress={() => {}} />
    </FlexView>
  );
}
