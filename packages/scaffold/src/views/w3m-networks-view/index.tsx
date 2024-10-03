import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FlexView, Icon, Link, ListItem, Separator, Text } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetUtil,
  NetworkController,
  RouterController,
  type CaipNetwork,
  AccountController,
  EventsController,
  RouterUtil
} from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function NetworksView() {
  const { caipNetwork, requestedCaipNetworks, approvedCaipNetworkIds, supportsAllNetworks } =
    NetworkController.state;
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth: width, padding } = useCustomDimensions();

  const onHelpPress = () => {
    RouterController.push('WhatIsANetwork');
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' });
  };

  const onNetworkPress = async (network: CaipNetwork) => {
    if (AccountController.state.isConnected && caipNetwork?.id !== network.id) {
      if (approvedCaipNetworkIds?.includes(network.id)) {
        await NetworkController.switchActiveNetwork(network);
        RouterUtil.navigateAfterNetworkSwitch(['ConnectingSiwe']);

        EventsController.sendEvent({
          type: 'track',
          event: 'SWITCH_NETWORK',
          properties: {
            network: network.id
          }
        });
      } else if (supportsAllNetworks) {
        RouterController.push('SwitchNetwork', { network });
      }
    } else if (!AccountController.state.isConnected) {
      NetworkController.setCaipNetwork(network);
      RouterController.push('Connect');
    }
  };

  const networksTemplate = () => {
    if (!requestedCaipNetworks?.length) return undefined;

    const approvedIds = approvedCaipNetworkIds;
    const requested = [...requestedCaipNetworks];

    if (approvedIds?.length) {
      requested?.sort((a, b) => {
        if (approvedIds.includes(a.id) && !approvedIds.includes(b.id)) return -1;
        if (approvedIds.includes(b.id) && !approvedIds.includes(a.id)) return 1;

        return 0;
      });
    }

    return requested.map(network => (
      <ListItem
        key={network.id}
        icon="networkPlaceholder"
        iconBackgroundColor="gray-glass-010"
        imageSrc={AssetUtil.getNetworkImage(network)}
        imageHeaders={imageHeaders}
        onPress={() => onNetworkPress(network)}
        testID="button-network"
        style={styles.networkItem}
        contentStyle={styles.networkItemContent}
        disabled={!supportsAllNetworks && !approvedCaipNetworkIds?.includes(network.id)}
      >
        <Text numberOfLines={1} color="fg-100">
          {network.name ?? 'Unknown'}
        </Text>
        {network.id === caipNetwork?.id && <Icon name="checkmark" color="accent-100" />}
      </ListItem>
    ));
  };

  return (
    <>
      <BottomSheetScrollView
        bounces={false}
        fadingEdgeLength={20}
        style={{ paddingHorizontal: padding }}
        contentContainerStyle={styles.contentContainer}
      >
        <FlexView flexDirection="row" flexWrap="wrap" padding={['xs', 'xs', 's', 'xs']}>
          {networksTemplate()}
        </FlexView>
      </BottomSheetScrollView>
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
