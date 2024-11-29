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
  NetworkController,
  RouterController,
  type CaipNetwork,
  EventsController,
  CoreHelperUtil,
  NetworkUtil
} from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function NetworksView() {
  const { caipNetwork, requestedCaipNetworks, approvedCaipNetworkIds, supportsAllNetworks } =
    NetworkController.state;
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

  const networksTemplate = () => {
    const networks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);

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

    return networks.map(network => (
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
          name={network.name ?? 'Unknown'}
          type="network"
          imageSrc={AssetUtil.getNetworkImage(network)}
          imageHeaders={imageHeaders}
          disabled={!supportsAllNetworks && !approvedCaipNetworkIds?.includes(network.id)}
          selected={caipNetwork?.id === network.id}
          onPress={() => onNetworkPress(network)}
        />
      </View>
    ));
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
        <Link size="sm" iconLeft="helpCircle" onPress={onHelpPress} style={styles.helpButton}>
          What is a network?
        </Link>
      </FlexView>
    </>
  );
}
