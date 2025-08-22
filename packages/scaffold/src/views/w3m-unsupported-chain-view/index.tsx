import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { Icon, ListItem, Separator, Text } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetUtil,
  CoreHelperUtil,
  ConnectionUtil,
  EventsController,
  NetworkController,
  NetworkUtil,
  type CaipNetwork,
  type NetworkControllerState,
  AssetController
} from '@reown/appkit-core-react-native';
import styles from './styles';

export function UnsupportedChainView() {
  const { caipNetwork, supportsAllNetworks, approvedCaipNetworkIds, requestedCaipNetworks } =
    useSnapshot(NetworkController.state) as NetworkControllerState;
  const { networkImages } = useSnapshot(AssetController.state);

  const [disconnecting, setDisconnecting] = useState(false);
  const networks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);
  const imageHeaders = ApiController._getApiHeaders();

  const onNetworkPress = async (network: CaipNetwork) => {
    const result = await NetworkUtil.handleNetworkSwitch(network);
    if (result?.type === 'SWITCH_NETWORK') {
      EventsController.sendEvent({
        type: 'track',
        event: 'SWITCH_NETWORK',
        properties: {
          network: network.id
        }
      });
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
      renderItem={({ item }) => (
        <ListItem
          key={item.id}
          icon="networkPlaceholder"
          iconBackgroundColor="gray-glass-010"
          imageSrc={AssetUtil.getNetworkImage(item, networkImages)}
          imageHeaders={imageHeaders}
          onPress={() => onNetworkPress(item)}
          testID="button-network"
          style={styles.networkItem}
          contentStyle={styles.networkItemContent}
          disabled={!supportsAllNetworks && !approvedCaipNetworkIds?.includes(item.id)}
        >
          <Text numberOfLines={1} color="fg-100">
            {item.name ?? 'Unknown'}
          </Text>
          {item.id === caipNetwork?.id && <Icon name="checkmark" color="accent-100" />}
        </ListItem>
      )}
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
