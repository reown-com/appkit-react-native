import { type StyleProp, type ViewStyle } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetController,
  AssetUtil,
  OptionsController,
  WcController,
  type WcControllerState
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import { ListItemLoader, ListWallet } from '@reown/appkit-ui-react-native';
import { UiUtil } from '../../../utils/UiUtil';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: WcWallet) => void;
}

export function AllWalletList({ itemStyle, onWalletPress }: Props) {
  const { installed, featured, recommended, prefetchLoading } = useSnapshot(ApiController.state);
  const { customWallets } = useSnapshot(OptionsController.state);
  const { recentWallets } = useSnapshot(WcController.state) as WcControllerState;
  const { walletImages } = useSnapshot(AssetController.state);
  const imageHeaders = ApiController._getApiHeaders();

  const combinedWallets = [
    ...(recentWallets?.slice(0, 1) ?? []),
    ...installed,
    ...featured,
    ...recommended,
    ...(customWallets ?? [])
  ];

  // Deduplicate by wallet ID
  const list = Array.from(
    new Map(combinedWallets.map(wallet => [wallet.id, wallet])).values()
  ).slice(0, UiUtil.TOTAL_VISIBLE_WALLETS);

  if (!list?.length) {
    return null;
  }

  return prefetchLoading ? (
    <>
      <ListItemLoader style={itemStyle} />
      <ListItemLoader style={itemStyle} />
    </>
  ) : (
    list.map(wallet => {
      const isRecent = recentWallets?.some(recentWallet => recentWallet.id === wallet.id);

      return (
        <ListWallet
          key={wallet?.id}
          imageSrc={AssetUtil.getWalletImage(wallet, walletImages)}
          imageHeaders={imageHeaders}
          name={wallet?.name ?? 'Unknown'}
          onPress={() => onWalletPress(wallet)}
          tagLabel={isRecent ? 'Recent' : undefined}
          tagVariant={isRecent ? 'shade' : undefined}
          style={itemStyle}
          installed={!!installed.find(installedWallet => installedWallet.id === wallet.id)}
        />
      );
    })
  );
}
