import { RouterController } from '@web3modal/core-react-native';
import { ListWallet, FlexView } from '@web3modal/ui-react-native';

export function ConnectView() {
  return (
    <FlexView padding="s" rowGap="2xs">
      <ListWallet name="Wallet Connect" tagLabel='QR Code' tagVariant='main' />
      <ListWallet name="Rainbow" />
      <ListWallet walletIcon="allWallets" name="All Wallets" tagLabel='230+' tagVariant='shade' onPress={() => RouterController.push('AllWallets')} />
    </FlexView>
  );
};
