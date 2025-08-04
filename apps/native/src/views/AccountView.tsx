import { StyleSheet } from 'react-native';
import { Text, FlexView } from '@reown/appkit-ui-react-native';
import { useAccount, useBalance } from 'wagmi';

export function AccountView() {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useBalance({ address });

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Wagmi Account Info</Text>
      <FlexView>
        <Text variant="small-600">Address:</Text>
        {isConnected ? <Text variant="small-400">{address}</Text> : null}
      </FlexView>
      {isLoading ? <Text variant="small-400">Fetching balance...</Text> : null}
      {data ? <FlexView>
          <Text variant="small-600">Balance:</Text>
          <Text variant="small-400">
            {data?.formatted} {data?.symbol}
          </Text>
        </FlexView> : null}
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    gap: 8
  }
});
