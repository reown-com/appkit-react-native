// import { useSnapshot } from 'valtio';
// import type { StyleProp, ViewStyle } from 'react-native';
// import {
//   ConnectorController,
//   AssetUtil,
//   RouterController,
//   ApiController
// } from '@reown/appkit-core-react-native';

// import { ListWallet } from '@reown/appkit-ui-react-native';
// import type { ConnectorType } from '@reown/appkit-common-react-native';

// interface Props {
//   itemStyle: StyleProp<ViewStyle>;
//   isWalletConnectEnabled: boolean;
// }

// TODO: check this for coinbase
export function ConnectorList(/*{ itemStyle, isWalletConnectEnabled }: Props*/) {
  // const { connectors } = useSnapshot(ConnectorController.state);
  // const excludeConnectors: ConnectorType[] = ['WALLET_CONNECT', 'AUTH'];
  // const imageHeaders = ApiController._getApiHeaders();

  // if (isWalletConnectEnabled) {
  //   // use wallet from api list
  //   excludeConnectors.push('COINBASE');
  // }

  // return connectors.map(connector => {
  //   if (excludeConnectors.includes(connector.type)) {
  //     return null;
  //   }

  //   return (
  //     <ListWallet
  //       key={connector.type}
  //       imageSrc={AssetUtil.getConnectorImage(connector)}
  //       imageHeaders={imageHeaders}
  //       name={connector.name || 'Unknown'}
  //       onPress={() => RouterController.push('ConnectingExternal', { connector })}
  //       style={itemStyle}
  //       installed={connector.installed}
  //     />
  //   );
  // });
  return null;
}
