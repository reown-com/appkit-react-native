import { useSnapshot } from 'valtio';
import { ScrollView, useWindowDimensions } from 'react-native';
import {
  CardSelect,
  CardSelectWidth,
  FlexView,
  Link,
  Separator,
  Spacing,
  Text
} from '@web3modal/ui-react-native';
import {
  ApiController,
  AssetUtil,
  NetworkController,
  RouterController,
  type CaipNetwork,
  AccountController
} from '@web3modal/core-react-native';

export function NetworksView() {
  const { isConnected } = useSnapshot(AccountController.state);
  const { caipNetwork, requestedCaipNetworks, approvedCaipNetworkIds, supportsAllNetworks } =
    useSnapshot(NetworkController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { width } = useWindowDimensions();
  const usableWidth = width - Spacing.s * 2;
  const numColumns = Math.floor(usableWidth / CardSelectWidth);
  const gap = Math.abs(Math.trunc((usableWidth - numColumns * CardSelectWidth) / (numColumns - 1)));

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

    const onNetworkPress = async (network: CaipNetwork) => {
      if (isConnected && caipNetwork?.id !== network.id) {
        if (approvedCaipNetworkIds?.includes(network.id)) {
          await NetworkController.switchActiveNetwork(network);
          RouterController.goBack();
        } else if (supportsAllNetworks) {
          RouterController.push('SwitchNetwork', { network });
        }
      } else if (!isConnected) {
        NetworkController.setCaipNetwork(network);
        RouterController.push('Connect');
      }
    };

    return requested.map(network => (
      <CardSelect
        key={network.id}
        name={network.name ?? 'Unknown'}
        type="network"
        imageSrc={AssetUtil.getNetworkImage(network)}
        imageHeaders={imageHeaders}
        disabled={!supportsAllNetworks && !approvedCaipNetworkIds?.includes(network.id)}
        selected={caipNetwork?.id === network.id}
        onPress={() => onNetworkPress(network)}
      />
    ));
  };

  return (
    <>
      <ScrollView bounces fadingEdgeLength={20}>
        <FlexView
          flexDirection="row"
          flexWrap="wrap"
          style={{ gap }}
          padding={['s', '0', 's', 's']}
        >
          {networksTemplate()}
        </FlexView>
      </ScrollView>
      <Separator />
      <FlexView gap="s" padding={['s', 's', '2xl', 's']} alignItems="center">
        <Text variant="small-400" color="fg-300" center>
          Your connected wallet may not support some of the networks available for this dApp
        </Text>
        <Link
          size="sm"
          iconLeft="helpCircle"
          onPress={() => RouterController.push('WhatIsANetwork')}
        >
          What is a network
        </Link>
      </FlexView>
    </>
  );
}
