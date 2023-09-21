import { ApiController, AssetUtil, RouterController } from '@web3modal/core-react-native';
import { ListWallet, FlexView } from '@web3modal/ui-react-native';

export function ConnectView() {

  const recommendedTemplate = () => {
    // TODO: Filter recent wallets
    const { recommended, featured } = ApiController.state
    if (!recommended.length || featured.length) {
      return null
    }
    const [first, second] = recommended;

    return [first, second].map(wallet =>
      <ListWallet key={wallet?.id} imageSrc={AssetUtil.getWalletImage(wallet)} imageHeaders={ApiController._getApiHeaders()} name={wallet?.name ?? 'Unknown'} onPress={() => RouterController.push('ConnectingWalletConnect', { wallet })} />
    )
  }

  const allWalletsTemplate = () => {
    return (
      <ListWallet walletIcon="allWallets" name="All Wallets" tagLabel='230+' tagVariant='shade' onPress={() => RouterController.push('AllWallets')} />
    )
  }

  return (
    <FlexView padding="s" rowGap="2xs">
      <ListWallet name="Wallet Connect" tagLabel='QR Code' tagVariant='main' />
      {recommendedTemplate()}
      {allWalletsTemplate()}
    </FlexView>
  );
};
