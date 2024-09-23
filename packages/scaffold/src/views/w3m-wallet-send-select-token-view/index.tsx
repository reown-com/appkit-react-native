import { useSnapshot } from 'valtio';

import { FlexView, ListToken, Text } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  AssetUtil,
  NetworkController,
  RouterController,
  SendController
} from '@reown/appkit-core-react-native';
import { ScrollView } from 'react-native';
import styles from './styles';
import type { Balance } from '@reown/appkit-common-react-native';

export function WalletSendSelectTokenView() {
  const { tokenBalance } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

  const onTokenPress = (token: Balance) => {
    SendController.setToken(token);
    SendController.setTokenAmount(undefined);
    RouterController.goBack();
  };

  return (
    <FlexView padding={['l', 'l', '2xl', 'l']} style={styles.container}>
      <ScrollView bounces={false} fadingEdgeLength={20}>
        <Text variant="paragraph-500" color="fg-200" style={styles.title}>
          Your tokens
        </Text>
        {tokenBalance?.map(token => (
          <ListToken
            key={token.name}
            name={token.name}
            imageSrc={token.iconUrl}
            networkSrc={networkImage}
            value={token.value}
            amount={token.quantity.numeric}
            currency={token.symbol}
            onPress={() => onTokenPress(token)}
          />
        ))}
      </ScrollView>
    </FlexView>
  );
}
