import type { CaipNetwork } from '@reown/appkit-common-react-native';
import type { Connector } from '@reown/appkit-core-react-native';

export interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[];
}
