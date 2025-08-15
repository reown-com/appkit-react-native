import { ScrollView, View } from 'react-native';
import {
  CardSelect,
  CardSelectWidth,
  FlexView,
  Link,
  Separator,
  Spacing,
  Text,
  useCustomDimensions
} from '@reown/appkit-ui-react-native';
import {
  ApiController,
  RouterController,
  EventsController,
  ConnectionsController,
  OptionsController,
  AssetController,
  AssetUtil
} from '@reown/appkit-core-react-native';
import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import styles from './styles';
import { useInternalAppKit } from '../../AppKitContext';
import { useSnapshot } from 'valtio';

export function NetworksView() {
  const { networks, isConnected } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth: width, padding } = useCustomDimensions();
  const numColumns = 4;
  const usableWidth = width - Spacing.xs * 2 - Spacing['4xs'];
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));
  const itemGap = Math.abs(
    Math.trunc((usableWidth - numColumns * CardSelectWidth) / numColumns) / 2
  );
  const { switchNetwork, back } = useInternalAppKit();

  const networkList = isConnected ? ConnectionsController.getConnectedNetworks() : networks;

  const onHelpPress = () => {
    RouterController.push('WhatIsANetwork');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' });
  };

  const networksTemplate = () => {
    const onNetworkPress = async (network: AppKitNetwork) => {
      await switchNetwork(network);
      back();
    };

    return networkList.map(network => {
      const isSelected = ConnectionsController.state.isConnected
        ? ConnectionsController.state.activeCaipNetworkId === network.caipNetworkId
        : OptionsController.state.defaultNetwork?.caipNetworkId === network.caipNetworkId;
      // eslint-disable-next-line valtio/state-snapshot-rule
      const networkImage = AssetUtil.getNetworkImage(network, networkImages);

      return (
        <View
          key={network.id}
          style={[
            styles.itemContainer,
            {
              width: itemWidth,
              marginVertical: itemGap
            }
          ]}
        >
          <CardSelect
            testID={`w3m-network-switch-${network.name ?? network.id}`}
            name={network.name ?? 'Unknown'}
            type="network"
            imageSrc={networkImage}
            imageHeaders={imageHeaders}
            selected={isSelected}
            onPress={() => onNetworkPress(network)}
          />
        </View>
      );
    });
  };

  return (
    <>
      <ScrollView
        bounces={false}
        fadingEdgeLength={20}
        style={{ paddingHorizontal: padding, marginBottom: Spacing.xl }}
      >
        <FlexView flexDirection="row" flexWrap="wrap" padding={['xs', 'xs', '4xl', 'xs']}>
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
