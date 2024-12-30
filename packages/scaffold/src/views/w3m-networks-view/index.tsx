import { useSnapshot } from 'valtio';
import { ScrollView, View } from 'react-native';
import {
  CardSelect,
  CardSelectWidth,
  FlexView,
  Link,
  Separator,
  Spacing,
  Text
} from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetUtil,
  ChainController,
  RouterController,
  EventsController,
  CoreHelperUtil,
  AccountController,
  ConnectorController,
  StorageUtil
} from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';
import { ConstantsUtil, type CaipNetwork } from '@reown/appkit-common-react-native';

export function NetworksView() {
  const { activeCaipNetwork } = useSnapshot(ChainController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth: width, padding } = useCustomDimensions();
  const numColumns = 4;
  const usableWidth = width - Spacing.xs * 2 - Spacing['4xs'];
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));
  const itemGap = Math.abs(
    Math.trunc((usableWidth - numColumns * CardSelectWidth) / numColumns) / 2
  );

  const onHelpPress = () => {
    RouterController.push('WhatIsANetwork');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' });
  };

  const getNetworkDisabled = (network: CaipNetwork) => {
    const networkNamespace = network.chainNamespace;
    const isNamespaceConnected = AccountController.getCaipAddress(networkNamespace);
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
    const supportsAllNetworks =
      ChainController.getNetworkProp('supportsAllNetworks', networkNamespace) !== false;
    const connectorId = ChainController.state.activeConnector?.id;
    const authConnector = ConnectorController.getAuthConnector();
    const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH && authConnector;

    if (!isNamespaceConnected || supportsAllNetworks || isConnectedWithAuth) {
      return false;
    }

    return !approvedCaipNetworkIds?.includes(network.caipNetworkId);
  };

  const onNetworkPress = async (network: CaipNetwork) => {
    const routerData = RouterController.state.data;
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
    const isSameNetwork = network.id === ChainController.state.activeCaipNetwork?.id;

    if (isSameNetwork) {
      return;
    }

    const isDifferentNamespace = network.chainNamespace !== ChainController.state.activeChain;
    const isNewNetworkConnected = ChainController.getAccountProp(
      'caipAddress',
      network.chainNamespace
    );
    const isCurrentNetworkConnected = AccountController.state.caipAddress;
    const isAuthConnected =
      (await StorageUtil.getConnectedConnectorId()) === ConstantsUtil.CONNECTOR_ID.AUTH;

    if (
      isDifferentNamespace &&
      isCurrentNetworkConnected &&
      !isNewNetworkConnected &&
      !isAuthConnected
    ) {
      //TODO Check this
      //@ts-expect-error
      RouterController.push('SwitchActiveChain', {
        switchToChain: network.chainNamespace,
        navigateTo: 'Connect',
        navigateWithReplace: true,
        network
      });
    } else {
      if (approvedCaipNetworkIds?.includes(network.caipNetworkId)) {
        await ChainController.switchActiveNetwork(network);
      } else {
        RouterController.push('SwitchNetwork', { ...routerData, network });
      }
    }
  };

  const networksTemplate = () => {
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();
    const networks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);

    return networks.map(network => {
      return (
        <View
          key={network.caipNetworkId}
          style={[
            styles.itemContainer,
            {
              width: itemWidth,
              marginVertical: itemGap
            }
          ]}
        >
          <CardSelect
            testID={`w3m-network-switch-${network.name ?? network.caipNetworkId}`}
            name={network.name ?? 'Unknown'}
            type="network"
            imageSrc={AssetUtil.getNetworkImage(network)}
            imageHeaders={imageHeaders}
            disabled={getNetworkDisabled(network)}
            selected={activeCaipNetwork?.id === network.id}
            onPress={() => onNetworkPress(network)}
          />
        </View>
      );
    });
  };

  return (
    <>
      <ScrollView bounces={false} fadingEdgeLength={20} style={{ paddingHorizontal: padding }}>
        <FlexView flexDirection="row" flexWrap="wrap" padding={['xs', 'xs', 's', 'xs']}>
          {networksTemplate()}
        </FlexView>
      </ScrollView>
      <Separator />
      <FlexView
        padding={['s', 's', '3xl', 's']}
        alignItems="center"
        alignSelf="center"
        style={{ width }}
      >
        <Text variant="small-400" color="fg-300" center>
          Your connected wallet may not support some of the networks available for this dApp
        </Text>
        <Link
          size="sm"
          iconLeft="helpCircle"
          onPress={onHelpPress}
          style={styles.helpButton}
          testID="what-is-a-network-button"
        >
          What is a network?
        </Link>
      </FlexView>
    </>
  );
}
