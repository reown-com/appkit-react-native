import { useSnapshot } from 'valtio';
import {
  ConnectorController,
  AssetUtil,
  RouterController,
  type ConnectorType,
  ApiController
} from '@web3modal/core-react-native';
import { ListWallet } from '@web3modal/ui-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface Props {
  itemStyle: StyleProp<ViewStyle>;
  isWalletConnectEnabled: boolean;
}

export function ConnectorList({ itemStyle, isWalletConnectEnabled }: Props) {
  const { connectors } = useSnapshot(ConnectorController.state);
  const excludeConnectors: ConnectorType[] = ['WALLET_CONNECT', 'EMAIL'];
  const imageHeaders = ApiController._getApiHeaders();

  if (isWalletConnectEnabled) {
    // use wallet from api list
    excludeConnectors.push('COINBASE');
  }

  return connectors.map(connector => {
    if (excludeConnectors.includes(connector.type)) {
      return null;
    }

    return (
      <ListWallet
        key={connector.type}
        imageSrc={AssetUtil.getConnectorImage(connector)}
        imageHeaders={imageHeaders}
        name={connector.name || 'Unknown'}
        onPress={() => RouterController.push('ConnectingExternal', { connector })}
        style={itemStyle}
        installed={connector.installed}
      />
    );
  });
}
