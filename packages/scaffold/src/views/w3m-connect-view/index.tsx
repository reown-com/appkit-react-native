import { useSnapshot } from 'valtio';
import { ScrollView } from 'react-native';
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  EventUtil,
  EventsController,
  OptionsController,
  RouterController
} from '@web3modal/core-react-native';
import type { ConnectorType, WcWallet } from '@web3modal/core-react-native';
import { ListWallet, FlexView, Separator } from '@web3modal/ui-react-native';
import { UiUtil } from '../../utils/UiUtil';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { ConnectEmailInput } from '../../partials/w3m-connect-email-input';
import styles from './styles';

export function ConnectView() {
  const { recommended, featured, installed, count } = useSnapshot(ApiController.state);
  const { recentWallets } = useSnapshot(ConnectionController.state);
  const { connectors } = useSnapshot(ConnectorController.state);
  const { customWallets } = useSnapshot(OptionsController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { padding } = useCustomDimensions();
  const isWalletConnectEnabled = connectors.find(c => c.type === 'WALLET_CONNECT');
  const isEmailEnabled = connectors.some(c => c.type === 'EMAIL');

  const RECENT_COUNT = recentWallets?.length ? (installed.length ? 1 : recentWallets?.length) : 0;

  const onWalletPress = (wallet: WcWallet, isInstalled?: boolean) => {
    const connector = connectors.find(c => c.explorerId === wallet.id);
    if (connector) {
      RouterController.push('ConnectingExternal', { connector, wallet });
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet });
    }

    const platform = EventUtil.getWalletPlatform(wallet, isInstalled);
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: wallet.name ?? connector?.name ?? 'Unknown', platform }
    });
  };

  const onViewAllPress = () => {
    RouterController.push('AllWallets');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_ALL_WALLETS' });
  };

  const emailTemplate = () => {
    if (!isEmailEnabled) {
      return null;
    }

    return (
      <>
        <ConnectEmailInput />
        {isWalletConnectEnabled && <Separator text="or" style={styles.emailSeparator} />}
      </>
    );
  };

  const recentTemplate = () => {
    if (!isWalletConnectEnabled || !recentWallets?.length) {
      return null;
    }

    return recentWallets.slice(0, RECENT_COUNT).map(wallet => {
      const isInstalled = !!installed.find(installedWallet => installedWallet.id === wallet.id);

      return (
        <ListWallet
          key={wallet?.id}
          imageSrc={AssetUtil.getWalletImage(wallet)}
          imageHeaders={imageHeaders}
          name={wallet?.name ?? 'Unknown'}
          onPress={() => onWalletPress(wallet!, isInstalled)}
          tagLabel="Recent"
          tagVariant="shade"
          style={styles.item}
          installed={isInstalled}
        />
      );
    });
  };

  const walletsTemplate = () => {
    if (!isWalletConnectEnabled) {
      return null;
    }

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

  const customWalletsTemplate = () => {
    if (!isWalletConnectEnabled || !customWallets?.length) {
      return null;
    }

    const list = filterOutRecentWallets([...customWallets]);

    return list.map(wallet => (
      <ListWallet
        key={wallet.id}
        imageSrc={wallet.image_url}
        name={wallet.name}
        onPress={() => onWalletPress(wallet)}
        style={styles.item}
      />
    ));
  };

  const connectorsTemplate = () => {
    const excludeConnectors: ConnectorType[] = ['WALLET_CONNECT', 'EMAIL'];

    if (isWalletConnectEnabled) {
      // use wallet from api list
      excludeConnectors.push('COINBASE');
    }

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

    const total = installed.length + count;
    const label = total > 10 ? `${Math.floor(total / 10) * 10}+` : total;

    return (
      <ListWallet
        name="All wallets"
        showAllWallets
        tagLabel={String(label)}
        tagVariant="shade"
        onPress={onViewAllPress}
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
        {emailTemplate()}
        {recentTemplate()}
        {walletsTemplate()}
        {customWalletsTemplate()}
        {connectorsTemplate()}
        {allWalletsButton()}
      </FlexView>
    </ScrollView>
  );
}
