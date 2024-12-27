import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { Icon, ListItem, Separator, Text } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetUtil,
  CoreHelperUtil,
  ConnectionUtil,
  ChainController,
  AccountController,
  RouterController
} from '@reown/appkit-core-react-native';
import styles from './styles';
import type { CaipNetwork } from '@reown/appkit-common-react-native';

export function UnsupportedChainView() {
  const { activeCaipNetwork } = useSnapshot(ChainController.state);

  const [disconnecting, setDisconnecting] = useState(false);
  const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
  const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();

  const networks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);
  const imageHeaders = ApiController._getApiHeaders();

  const onNetworkPress = async (network: CaipNetwork) => {
    const caipAddress = AccountController.state.caipAddress;

    const routerData = RouterController.state.data;

    if (caipAddress) {
      if (approvedCaipNetworkIds?.includes(network.caipNetworkId)) {
        await ChainController.switchActiveNetwork(network);
      } else {
        RouterController.push('SwitchNetwork', { ...routerData, network });
      }
    } else if (!caipAddress) {
      ChainController.setActiveCaipNetwork(network);
      RouterController.push('Connect');
    }
  };

  const onDisconnect = async () => {
    setDisconnecting(true);
    await ConnectionUtil.disconnect();
    setDisconnecting(false);
  };

  return (
    <FlatList
      data={networks}
      fadingEdgeLength={20}
      ListHeaderComponentStyle={styles.header}
      ListHeaderComponent={
        <Text variant="small-400" color="fg-200" center>
          The swap feature doesn't support your current network. Switch to an available option to
          continue.
        </Text>
      }
      contentContainerStyle={styles.contentContainer}
      renderItem={({ item }) => {
        const supportsAllNetworks = ChainController.getNetworkProp(
          'supportsAllNetworks',
          item.chainNamespace
        );

        return (
          <ListItem
            key={item.id}
            icon="networkPlaceholder"
            iconBackgroundColor="gray-glass-010"
            imageSrc={AssetUtil.getNetworkImage(item)}
            imageHeaders={imageHeaders}
            onPress={() => onNetworkPress(item)}
            testID="button-network"
            style={styles.networkItem}
            contentStyle={styles.networkItemContent}
            disabled={!supportsAllNetworks && !approvedCaipNetworkIds?.includes(item.caipNetworkId)}
          >
            <Text numberOfLines={1} color="fg-100">
              {item.name ?? 'Unknown'}
            </Text>
            {item.id === activeCaipNetwork?.id && <Icon name="checkmark" color="accent-100" />}
          </ListItem>
        );
      }}
      ListFooterComponent={
        <>
          <Separator text="or" style={styles.separator} />
          <ListItem
            icon="disconnect"
            onPress={onDisconnect}
            loading={disconnecting}
            iconBackgroundColor="gray-glass-010"
            testID="button-disconnect"
          >
            <Text color="fg-200">Disconnect</Text>
          </ListItem>
        </>
      }
    />
  );
}
