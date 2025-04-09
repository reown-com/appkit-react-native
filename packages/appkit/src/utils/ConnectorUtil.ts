import type { WalletConnector } from '@reown/appkit-common-react-native';
import { WalletConnectConnector } from '../connectors/WalletConnectConnector';

const mockMetadata = {
  name: 'Reown',
  description: 'Reown App',
  url: 'https://reown.xyz',
  icons: ['https://reown.xyz/icon.png']
};

export const ConnectorUtil = {
  async createConnector({
    walletType,
    extraConnectors,
    projectId
  }: {
    walletType: string;
    extraConnectors: WalletConnector[];
    projectId: string;
  }): Promise<WalletConnector> {
    // Check if an extra connector was provided by the developer
    const CustomConnector = extraConnectors.find(connector => connector.type === walletType);
    if (CustomConnector) return CustomConnector;

    // If no extra connector is provided, default to WalletConnectConnector
    if (walletType === 'walletconnect')
      return WalletConnectConnector.create({ projectId, metadata: mockMetadata });

    throw new Error(`Unsupported wallet type: ${walletType}`);
  }
};
