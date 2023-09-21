import { useSnapshot } from 'valtio';
import { ApiController, AssetUtil, RouterController } from '@web3modal/core-react-native';
import { ListWallet, FlexView } from '@web3modal/ui-react-native';

export function ConnectView() {
  const { recommended, featured, count } = useSnapshot(ApiController.state);

  const recommendedTemplate = () => {
    // TODO: Filter recent wallets
    if (!recommended.length || featured.length) {
      return null;
    }
    const [first, second] = recommended;

    return [first, second].map(wallet => (
      <ListWallet
        key={wallet?.id}
        imageSrc={AssetUtil.getWalletImage(wallet)}
        imageHeaders={ApiController._getApiHeaders()}
        name={wallet?.name ?? 'Unknown'}
        onPress={() => RouterController.push('ConnectingWalletConnect', { wallet })}
      />
    ));
  };

  const allWalletsTemplate = () => {
    return (
      <ListWallet
        walletIcon="allWallets"
        name="All Wallets"
        tagLabel={`${Math.floor(count / 10) * 10}+`}
        tagVariant="shade"
        onPress={() => RouterController.push('AllWallets')}
      />
    );
  };

  return (
    <FlexView padding="s" rowGap="2xs">
      {recommendedTemplate()}
      {allWalletsTemplate()}
    </FlexView>
  );
}
