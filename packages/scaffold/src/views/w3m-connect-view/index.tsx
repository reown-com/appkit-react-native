import { useSnapshot } from 'valtio';
import { ScrollView } from 'react-native';
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  RouterController
} from '@web3modal/core-react-native';
import type { ConnectorType, WcWallet } from '@web3modal/core-react-native';
import { ListWallet, FlexView } from '@web3modal/ui-react-native';
import { UiUtil } from '../../utils/UiUtil';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function ConnectView() {
  const { recommended, featured, installed, count } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state);
  const { connectors } = useSnapshot(ConnectorController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { padding } = useCustomDimensions();
  const isWalletConnectEnabled = connectors.find(c => c.type === 'WALLET_CONNECT');

  const RECENT_COUNT = recentWallets?.length ? (installed.length ? 1 : 2) : 0;

  const onWalletPress = (wallet: WcWallet) => {
    const connector = connectors.find(c => c.explorerId === wallet.id);
    if (connector) {
      RouterController.push('ConnectingExternal', { connector, wallet });
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet });
    }
  };

  const recentTemplate = () => {
    if (!isWalletConnectEnabled || !recentWallets?.length) {
      return null;
    }

    return recentWallets
      .slice(0, RECENT_COUNT)
      .map(wallet => (
        <ListWallet
          key={wallet?.id}
          imageSrc={AssetUtil.getWalletImage(wallet)}
          imageHeaders={imageHeaders}
          name={wallet?.name ?? 'Unknown'}
          onPress={() => onWalletPress(wallet!)}
          tagLabel="Recent"
          tagVariant="shade"
          style={styles.item}
          installed={!!installed.find(installedWallet => installedWallet.id === wallet.id)}
        />
      ));
  };

  const walletsTemplate = () => {
    const list = filterOutRecentWallets([...installed, ...featured, ...recommended]);

    return list
      .slice(0, UiUtil.TOTAL_VISIBLE_WALLETS - RECENT_COUNT)
      .map(wallet => (
        <ListWallet
          key={wallet?.id}
          imageSrc={AssetUtil.getWalletImage(wallet)}
          imageHeaders={imageHeaders}
          name={wallet?.name ?? 'Unknown'}
          onPress={() => onWalletPress(wallet!)}
          style={styles.item}
          installed={!!installed.find(installedWallet => installedWallet.id === wallet.id)}
        />
      ));
  };

  const connectorsTemplate = () => {
    const excludeConnectors: ConnectorType[] = ['WALLET_CONNECT', 'COINBASE'];

    return connectors.map(connector => {
      if (excludeConnectors.includes(connector.type)) {
        return null;
      }

      return (
        <ListWallet
          key={connector.type}
          imageSrc={AssetUtil.getConnectorImage(connector)}
          imageHeaders={imageHeaders}
          name={connector.name || 'Unknown'}
          onPress={() => RouterController.push('ConnectingExternal', { connector })}
          style={styles.item}
          installed={connector.installed}
        />
      );
    });
  };

  const allWalletsButton = () => {
    if (!isWalletConnectEnabled) {
      return null;
    }

    const label = count > 10 ? `${Math.floor(count / 10) * 10}+` : count;

    return (
      <ListWallet
        name="All wallets"
        showAllWallets
        tagLabel={String(label)}
        tagVariant="shade"
        onPress={() => RouterController.push('AllWallets')}
        style={styles.item}
        testID="button-all-wallets"
      />
    );
  };

  const filterOutRecentWallets = (wallets: WcWallet[]) => {
    const recentIds = recentWallets?.slice(0, RECENT_COUNT).map(wallet => wallet.id);
    if (!recentIds?.length) return wallets;

    const filtered = wallets.filter(wallet => !recentIds.includes(wallet.id));

    return filtered;
  };

  return (
    <ScrollView style={{ paddingHorizontal: padding }} bounces={false}>
      <FlexView padding={['xs', 's', '2xl', 's']}>
        {recentTemplate()}
        {walletsTemplate()}
        {connectorsTemplate()}
        {allWalletsButton()}
      </FlexView>
    </ScrollView>
  );
}
