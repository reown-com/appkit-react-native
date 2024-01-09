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
} from '@web3modal/ui-react-native';
import {
  ApiController,
  AssetUtil,
  NetworkController,
  RouterController,
  type CaipNetwork,
  AccountController
} from '@web3modal/core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function NetworksView() {
  const { isConnected } = useSnapshot(AccountController.state);
  const { caipNetwork, requestedCaipNetworks, approvedCaipNetworkIds, supportsAllNetworks } =
    useSnapshot(NetworkController.state);
  const imageHeaders = ApiController._getApiHeaders();
  const { maxWidth: width, padding } = useCustomDimensions();
  const numColumns = 4;
  const usableWidth = width - Spacing.xs * 2 - Spacing['4xs'];
  const itemWidth = Math.abs(Math.trunc(usableWidth / numColumns));
  const itemGap = Math.abs(
    Math.trunc((usableWidth - numColumns * CardSelectWidth) / numColumns) / 2
  );

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
        <Link
          size="sm"
          iconLeft="helpCircle"
          onPress={() => RouterController.push('WhatIsANetwork')}
          style={styles.helpButton}
        >
          What is a network
        </Link>
      </FlexView>
    </>
  );
}
