import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  RouterController
} from '@web3modal/core-react-native';
import type { WcWallet } from '@web3modal/core-react-native';
import { ListWallet, FlexView } from '@web3modal/ui-react-native';

export function ConnectView() {
  const { recommended, featured, count } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state);
  const imageHeaders = ApiController._getApiHeaders();

  const onWalletPress = (wallet: WcWallet) => {
    RouterController.push('ConnectingWalletConnect', { wallet });
  };

  const recentTemplate = () => {
    if (!recentWallets?.length) {
      return null;
    }

    return recentWallets.map(wallet => (
      <ListWallet
        key={wallet?.id}
        imageSrc={AssetUtil.getWalletImage(wallet)}
        imageHeaders={imageHeaders}
        name={wallet?.name ?? 'Unknown'}
        onPress={() => onWalletPress(wallet!)}
        tagLabel="Recent"
        tagVariant="shade"
      />
    ));
  };

  const featuredTemplate = () => {
    if (!featured.length) {
      return null;
    }

    const list = filterOutRecentWallets([...featured]);

    return list
      .slice(8)
      .map(wallet => (
        <ListWallet
          key={wallet?.id}
          imageSrc={AssetUtil.getWalletImage(wallet)}
          imageHeaders={imageHeaders}
          name={wallet?.name ?? 'Unknown'}
          onPress={() => onWalletPress(wallet!)}
        />
      ));
  };

  const recommendedTemplate = () => {
    if (!recommended.length || featured.length) {
      return null;
    }
    const [first, second] = filterOutRecentWallets([...recommended]);

    return [first, second].map(wallet => (
      <ListWallet
        key={wallet?.id}
        imageSrc={AssetUtil.getWalletImage(wallet)}
        imageHeaders={imageHeaders}
        name={wallet?.name ?? 'Unknown'}
        onPress={() => onWalletPress(wallet!)}
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

  const filterOutRecentWallets = (wallets: WcWallet[]) => {
    const recentIds = recentWallets?.map(wallet => wallet.id);
    if (!recentIds?.length) return wallets;

    const filtered = wallets.filter(wallet => !recentIds.includes(wallet.id));
    return filtered;
  };

  return (
    <FlexView padding="s" rowGap="2xs">
      {recentTemplate()}
      {featuredTemplate()}
      {recommendedTemplate()}
      {allWalletsTemplate()}
    </FlexView>
  );
}
