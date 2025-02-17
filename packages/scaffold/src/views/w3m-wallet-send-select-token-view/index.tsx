import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { ScrollView } from 'react-native';
import { FlexView, InputText, ListToken, Text } from '@reown/appkit-ui-react-native';
import {
  AccountController,
  AssetUtil,
  NetworkController,
  RouterController,
  SendController
} from '@reown/appkit-core-react-native';
import type { Balance } from '@reown/appkit-common-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { Placeholder } from '../../partials/w3m-placeholder';
import styles from './styles';

export function WalletSendSelectTokenView() {
  const { padding } = useCustomDimensions();
  const { tokenBalance } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { token } = useSnapshot(SendController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [filteredTokens, setFilteredTokens] = useState(tokenBalance ?? []);

  const onSearchChange = (value: string) => {
    setTokenSearch(value);
    const filtered = AccountController.state.tokenBalance?.filter(_token =>
      _token.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTokens(filtered ?? []);
  };

  const onTokenPress = (_token: Balance) => {
    SendController.setToken(_token);
    SendController.setTokenAmount(undefined);
    RouterController.goBack();
  };

  return (
    <FlexView
      margin={['l', '0', '2xl', '0']}
      style={[styles.container, { paddingHorizontal: padding }]}
    >
      <FlexView margin={['0', 'm', 'm', 'm']}>
        <InputText
          value={tokenSearch}
          icon="search"
          placeholder="Search token"
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
        />
      </FlexView>
      <ScrollView bounces={false} fadingEdgeLength={20} contentContainerStyle={styles.tokenList}>
        <Text variant="paragraph-500" color="fg-200" style={styles.title}>
          Your tokens
        </Text>
        {filteredTokens.length ? (
          filteredTokens.map((_token, index) => (
            <ListToken
              key={`${_token.name}${index}`}
              name={_token.name}
              imageSrc={_token.iconUrl}
              networkSrc={networkImage}
              value={_token.value}
              amount={_token.quantity.numeric}
              currency={_token.symbol}
              onPress={() => onTokenPress(_token)}
              disabled={_token.address === token?.address}
            />
          ))
        ) : (
          <Placeholder
            icon="coinPlaceholder"
            title="No tokens found"
            description="Your tokens will appear here"
          />
        )}
      </ScrollView>
    </FlexView>
  );
}
