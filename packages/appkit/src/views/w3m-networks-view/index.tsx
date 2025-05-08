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
  NetworkController,
  RouterController,
  EventsController,
  ConnectionsController,
  AssetUtil
} from '@reown/appkit-core-react-native';
import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';
import { useAppKit } from '../../AppKitContext';

export function NetworksView() {
  const { caipNetwork } = NetworkController.state;
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth: width, padding } = useCustomDimensions();
  const numColumns = 4;
  const usableWidth = width - Spacing.xs * 2 - Spacing['4xs'];
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));
  const itemGap = Math.abs(
    Math.trunc((usableWidth - numColumns * CardSelectWidth) / numColumns) / 2
  );
  const { switchNetwork } = useAppKit();

  const onHelpPress = () => {
    RouterController.push('WhatIsANetwork');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' });
  };

  const networksTemplate = () => {
    //TODO: should show requested networks disabled
    // const networks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);
    const networks = ConnectionsController.getConnectedNetworks();

    const onNetworkPress = async (network: AppKitNetwork) => {
      await switchNetwork(network);
      RouterController.goBack();
    };

    return networks.map(network => {
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
            imageSrc={AssetUtil.getNetworkImage(network.id)}
            imageHeaders={imageHeaders}
            // disabled={!supportsAllNetworks && !approvedCaipNetworkIds?.includes(network.caipNetworkId)}
            selected={caipNetwork?.id === network.id}
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
