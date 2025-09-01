import { useSnapshot } from 'valtio';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { ListItem, Separator, Text } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetController,
  AssetUtil,
  ConnectionsController
} from '@reown/appkit-core-react-native';
import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import { useInternalAppKit } from '../../AppKitContext';
import styles from './styles';

export function UnsupportedChainView() {
  const { networkImages } = useSnapshot(AssetController.state);
  const [disconnecting, setDisconnecting] = useState(false);
  const networks = ConnectionsController.getConnectedNetworks();
  const imageHeaders = ApiController._getApiHeaders();
  const { disconnect, switchNetwork } = useInternalAppKit();

  const onNetworkPress = async (network: AppKitNetwork) => {
    await switchNetwork(network);
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
          The current network is not supported by this application. Please switch to an available
          option to continue.
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
        >
          <Text numberOfLines={1} color="fg-100">
            {item.name ?? 'Unknown'}
          </Text>
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
