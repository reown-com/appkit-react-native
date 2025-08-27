import { useSnapshot } from 'valtio';
import { FlexView, Text, Banner, NetworkImage, ScrollView } from '@reown/appkit-ui-react-native';
import {
  ApiController,
  AssetController,
  AssetUtil,
  ConnectionsController
} from '@reown/appkit-core-react-native';
import styles from './styles';

export function WalletCompatibleNetworks() {
  const { networks, accountType } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const isSmartAccount = accountType === 'smartAccount';

  const approvedNetworks = isSmartAccount
    ? ConnectionsController.getSmartAccountEnabledNetworks()
    : networks.filter(
        network => network?.chainNamespace === ConnectionsController.state.activeNamespace
      );

  const imageHeaders = ApiController._getApiHeaders();

  return (
    <ScrollView>
      <FlexView padding={['xl', 's', 'l', 's']}>
        <Banner icon="warningCircle" text="You can only receive assets on these networks." />
        {approvedNetworks.map((network, index) => (
          <FlexView
            key={network?.id ?? index}
            flexDirection="row"
            alignItems="center"
            padding={['s', 's', 's', 's']}
          >
            <NetworkImage
              imageSrc={AssetUtil.getNetworkImage(network, networkImages)}
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
