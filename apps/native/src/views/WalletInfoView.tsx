import { Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAccount, useWalletInfo } from '@reown/appkit-react-native';
import { FlexView, Text } from '@reown/appkit-ui-react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function WalletInfoView({ style }: Props) {
  const { walletInfo } = useWalletInfo();
  const { address, chain } = useAccount();

  return walletInfo ? (
    <FlexView style={style} padding="m" alignItems="center">
      <Text variant="small-600" style={styles.label}>
        Connected to
      </Text>
      <FlexView flexDirection="row" alignItems="center">
        {walletInfo?.icons?.[0] ? <Image style={styles.logo} source={{ uri: walletInfo?.icons?.[0] }} /> : null}
        {walletInfo?.name ? <Text variant="small-400">{walletInfo?.name}</Text> : null}
      </FlexView>
        {address ? <Text ellipsizeMode="middle" numberOfLines={1} variant="small-400">Address: {address}</Text> : null}
        {chain?.name ? <Text variant="small-400">Chain: {chain?.name}</Text> : null}
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 2
  },
  logo: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 4
  }
});
