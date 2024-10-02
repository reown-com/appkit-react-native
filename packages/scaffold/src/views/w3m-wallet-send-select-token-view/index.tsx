import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
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
import styles from './styles';

export function WalletSendSelectTokenView() {
  const { padding } = useCustomDimensions();
  const { tokenBalance } = useSnapshot(AccountController.state);
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [filteredTokens, setFilteredTokens] = useState(tokenBalance ?? []);

  const onSearchChange = (value: string) => {
    setTokenSearch(value);
    const filtered = AccountController.state.tokenBalance?.filter(token =>
      token.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTokens(filtered ?? []);
  };

  const onTokenPress = (token: Balance) => {
    SendController.setToken(token);
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
      <BottomSheetScrollView
        bounces={false}
        fadingEdgeLength={20}
        contentContainerStyle={styles.tokenList}
      >
        <Text variant="paragraph-500" color="fg-200" style={styles.title}>
          Your tokens
        </Text>
        {filteredTokens.map((token, index) => (
          <ListToken
            key={`${token.name}${index}`}
            name={token.name}
            imageSrc={token.iconUrl}
            networkSrc={networkImage}
            value={token.value}
            amount={token.quantity.numeric}
            currency={token.symbol}
            onPress={() => onTokenPress(token)}
          />
        ))}
      </BottomSheetScrollView>
    </FlexView>
  );
}
