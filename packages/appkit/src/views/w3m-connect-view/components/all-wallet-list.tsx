import { type StyleProp, type ViewStyle } from 'react-native';
import { useSnapshot } from 'valtio';
import {
  ApiController,
  AssetController,
  AssetUtil,
  EventsController,
  OptionsController,
  WcController,
  type WcControllerState
} from '@reown/appkit-core-react-native';
import { type WcWallet } from '@reown/appkit-common-react-native';
import { ListItemLoader, ListWallet } from '@reown/appkit-ui-react-native';
import { UiUtil } from '../../../utils/UiUtil';
import { useEffect, useMemo, useRef } from 'react';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  onWalletPress: (wallet: WcWallet, displayIndex: number, isInstalled?: boolean) => void;
}

export function AllWalletList({ itemStyle, onWalletPress }: Props) {
  const { installed, featured, recommended, prefetchLoading } = useSnapshot(ApiController.state);
  const { customWallets } = useSnapshot(OptionsController.state);
  const { recentWallets } = useSnapshot(WcController.state) as WcControllerState;
  const { walletImages } = useSnapshot(AssetController.state);
  const imageHeaders = ApiController._getApiHeaders();

  // Track which wallets have been tracked to prevent duplicates
  const trackedWalletsRef = useRef<Set<string>>(new Set());

  const list = useMemo(() => {
    const combinedWallets = [
      ...(recentWallets?.slice(0, 1) ?? []),
      ...installed,
      ...featured,
      ...recommended,
      ...(customWallets ?? [])
    ];

    // Deduplicate by wallet ID
    return Array.from(new Map(combinedWallets.map(wallet => [wallet.id, wallet])).values()).slice(
      0,
      UiUtil.TOTAL_VISIBLE_WALLETS
    );
  }, [recentWallets, installed, featured, recommended, customWallets]);

  // Track impressions once when the list stabilizes
  useEffect(() => {
    if (!prefetchLoading && list.length > 0) {
      list.forEach((wallet, index) => {
        if (!trackedWalletsRef.current.has(wallet.id)) {
          trackedWalletsRef.current.add(wallet.id);
          const isInstalled = !!ApiController.state.installed.find(
            installedWallet => installedWallet.id === wallet.id
          );
          EventsController.trackWalletImpression({
            wallet,
            view: 'Connect',
            displayIndex: index,
            // eslint-disable-next-line valtio/state-snapshot-rule
            installed: isInstalled
          });
        }
      });
    }
  }, [prefetchLoading, list]);

  if (!list?.length) {
    return null;
  }

  return prefetchLoading ? (
    <>
      <ListItemLoader style={itemStyle} />
      <ListItemLoader style={itemStyle} />
    </>
  ) : (
    list.map((wallet, index) => {
      const isRecent = recentWallets?.some(recentWallet => recentWallet.id === wallet.id);
      //eslint-disable-next-line valtio/state-snapshot-rule
      const isInstalled = !!installed.find(installedWallet => installedWallet.id === wallet.id);

      return (
        <ListWallet
          key={wallet?.id}
          imageSrc={AssetUtil.getWalletImage(wallet, walletImages)}
          imageHeaders={imageHeaders}
          name={wallet?.name ?? 'Unknown'}
          onPress={() => onWalletPress(wallet, index, isInstalled)}
          tagLabel={isRecent ? 'Recent' : undefined}
          tagVariant={isRecent ? 'shade' : undefined}
          style={itemStyle}
          installed={isInstalled}
        />
      );
    })
  );
}
