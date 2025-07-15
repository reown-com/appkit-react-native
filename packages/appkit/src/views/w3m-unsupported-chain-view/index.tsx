import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { Icon, ListItem, Separator, Text } from '@reown/appkit-ui-react-native';
import { ApiController, AssetUtil, ConnectionsController } from '@reown/appkit-core-react-native';
import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import { useAppKit } from '../../AppKitContext';
import styles from './styles';

export function UnsupportedChainView() {
  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const [disconnecting, setDisconnecting] = useState(false);
  //TODO: should show requested networks disabled
  // const networks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);
  const networks = ConnectionsController.getConnectedNetworks();
  const imageHeaders = ApiController._getApiHeaders();
  const { disconnect, switchNetwork } = useAppKit();

  const onNetworkPress = async (network: AppKitNetwork) => {
    switchNetwork(network);
  };

  const onDisconnect = async () => {
    setDisconnecting(true);
    await disconnect(ConnectionsController.state.activeNamespace);
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
          imageSrc={AssetUtil.getNetworkImage(item.id)}
          imageHeaders={imageHeaders}
          onPress={() => onNetworkPress(item)}
          testID="button-network"
          style={styles.networkItem}
          contentStyle={styles.networkItemContent}
        >
          <Text numberOfLines={1} color="fg-100">
            {item.name ?? 'Unknown'}
          </Text>
          {item.id === activeNetwork?.id && <Icon name="checkmark" color="accent-100" />}
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
