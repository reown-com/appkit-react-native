import { useState } from 'react';
import { useSnapshot } from 'valtio';
import { FlatList } from 'react-native';
import {
  FlexView,
  InputText,
  ListToken,
  ListTokenTotalHeight,
  Text
} from '@reown/appkit-ui-react-native';

import {
  AssetUtil,
  NetworkController,
  RouterController,
  SwapController,
  type SwapTokenWithBalance
} from '@reown/appkit-core-react-native';

import { useCustomDimensions } from '../../hooks/useCustomDimensions';
import { Placeholder } from '../../partials/w3m-placeholder';
import styles from './styles';

export function SwapSelectTokenView() {
  const { padding } = useCustomDimensions();
  const { caipNetwork } = useSnapshot(NetworkController.state);
  const { myTokensWithBalance, popularTokens } = useSnapshot(SwapController.state);

  const networkImage = AssetUtil.getNetworkImage(caipNetwork);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const isSourceToken = RouterController.state.data?.swapTarget === 'sourceToken';
  const [filteredTokens, setFilteredTokens] = useState(
    isSourceToken ? myTokensWithBalance : popularTokens
  );

  const onSearchChange = (value: string) => {
    let filtered = [];
    setTokenSearch(value);

    if (isSourceToken) {
      filtered =
        SwapController.state.myTokensWithBalance?.filter(token =>
          token.name.toLowerCase().includes(value.toLowerCase())
        ) ?? [];
    } else {
      filtered =
        SwapController.state.popularTokens?.filter(token =>
          token.name.toLowerCase().includes(value.toLowerCase())
        ) ?? [];
    }

    setFilteredTokens(filtered);
  };

  const onTokenPress = (token: SwapTokenWithBalance) => {
    if (isSourceToken) {
      SwapController.setSourceToken(token);
    } else {
      SwapController.setToToken(token);
      if (SwapController.state.sourceToken && SwapController.state.sourceTokenAmount) {
        SwapController.swapTokens();
      }
    }
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
      <FlatList
        data={filteredTokens}
        bounces={false}
        fadingEdgeLength={20}
        contentContainerStyle={styles.tokenList}
        ListHeaderComponent={
          <Text variant="paragraph-500" color="fg-200" style={styles.title}>
            Your tokens
          </Text>
        }
        ListEmptyComponent={
          <Placeholder
            icon="coinPlaceholder"
            title="No tokens found"
            description="Your tokens will appear here"
          />
        }
        getItemLayout={(_, index) => ({
          length: ListTokenTotalHeight,
          offset: ListTokenTotalHeight * index,
          index
        })}
        renderItem={({ item }) => (
          <ListToken
            key={item.name}
            name={item.name}
            imageSrc={item.logoUri}
            networkSrc={networkImage}
            value={item.value}
            amount={item.quantity.numeric}
            currency={item.symbol}
            onPress={() => onTokenPress(item)}
          />
        )}
      />
    </FlexView>
  );
}
