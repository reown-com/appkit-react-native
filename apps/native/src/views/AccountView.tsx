import { View } from 'react-native';
import { Text } from '@reown/appkit-ui-react-native';
import { useAccount, useBalance } from 'wagmi';

export function AccountView() {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useBalance({ address });

  return isConnected ? (
    <View>
      <Text variant="large-600">Wagmi Account Info</Text>
      {isConnected && <Text>{address}</Text>}
      {isLoading && <Text>Fetching balance...</Text>}
      {data && (
        <Text>
          Balance: {data?.formatted} {data?.symbol}
        </Text>
      )}
    </View>
  ) : null;
}
