import { ScrollView } from 'react-native';
import { useSnapshot } from 'valtio';
import { FlexView, Text, Banner, NetworkImage } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  ApiController,
  AssetUtil,
  ChainController,
  CoreHelperUtil
} from '@reown/appkit-core-react-native';
import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import styles from './styles';

export function WalletCompatibleNetworks() {
  const { padding } = useCustomDimensions();
  const { preferredAccountType } = useSnapshot(AccountController.state);
  const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();
  const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
  const isNetworkEnabledForSmartAccounts = ChainController.checkIfSmartAccountEnabled();

  let sortedNetworks = CoreHelperUtil.sortNetworks(approvedCaipNetworkIds, requestedCaipNetworks);
  const imageHeaders = ApiController._getApiHeaders();

  if (isNetworkEnabledForSmartAccounts && preferredAccountType === 'smartAccount') {
    if (!ChainController.state.activeCaipNetwork) {
      return null;
    }

    const smartAccountEnabledNetworkIds = ChainController.getSmartAccountEnabledNetworks(
      ChainController.state.activeCaipNetwork?.chainNamespace
    );

    sortedNetworks = requestedCaipNetworks.filter(
      network => smartAccountEnabledNetworkIds?.includes(Number(network.id))
    );
  }

  return (
    <ScrollView bounces={false} style={{ paddingHorizontal: padding }} fadingEdgeLength={20}>
      <FlexView padding={['xl', 's', '2xl', 's']}>
        <Banner icon="warningCircle" text="You can only receive assets on these networks." />
        {sortedNetworks.map((network, index) => (
          <FlexView
            key={network?.id ?? index}
            flexDirection="row"
            alignItems="center"
            padding={['s', 's', 's', 's']}
          >
            <NetworkImage
              imageSrc={AssetUtil.getNetworkImage(network)}
              imageHeaders={imageHeaders}
              size="sm"
              style={styles.image}
            />
            <Text color="fg-100" variant="paragraph-500">
              {network?.name ?? 'Unknown Network'}
            </Text>
          </FlexView>
        ))}
      </FlexView>
    </ScrollView>
  );
}
