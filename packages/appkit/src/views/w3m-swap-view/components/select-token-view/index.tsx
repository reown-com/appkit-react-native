import { useState } from 'react';
import { useSnapshot } from 'valtio';
import {
  ScrollView,
  SectionList,
  View,
  type SectionListData,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import {
  FlexView,
  IconLink,
  InputText,
  ListToken,
  ListTokenTotalHeight,
  Separator,
  Text,
  TokenButton,
  useTheme
} from '@reown/appkit-ui-react-native';

import {
  AssetController,
  AssetUtil,
  ConnectionsController,
  SwapController,
  type SwapControllerState,
  type SwapInputTarget,
  type SwapTokenWithBalance
} from '@reown/appkit-core-react-native';

import { useCustomDimensions } from '../../../../hooks/useCustomDimensions';
import { Placeholder } from '../../../../partials/w3m-placeholder';
import styles from './styles';
import { createSections } from './utils';

interface Props {
  onClose: () => void;
  type?: SwapInputTarget;
  style?: StyleProp<ViewStyle>;
}

export function SwapSelectTokenView({ onClose, type, style }: Props) {
  const { padding } = useCustomDimensions();
  const Theme = useTheme();
  const { activeNetwork } = useSnapshot(ConnectionsController.state);
  const { networkImages } = useSnapshot(AssetController.state);
  const { sourceToken, suggestedTokens, myTokensWithBalance } = useSnapshot(
    SwapController.state
  ) as SwapControllerState;

  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const isSourceToken = type === 'sourceToken';

  const [filteredTokens, setFilteredTokens] = useState(
    createSections(isSourceToken, tokenSearch, myTokensWithBalance)
  );
  const suggestedList = suggestedTokens
    ?.filter(token => token.address !== SwapController.state.sourceToken?.address)
    .slice(0, 8);

  const onSearchChange = (value: string) => {
    setTokenSearch(value);
    setFilteredTokens(createSections(isSourceToken, value, myTokensWithBalance));
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
    onClose();
  };

  return (
    <FlexView
      padding={['xl', '0', '0', '0']}
      style={[
        styles.container,
        {
          paddingHorizontal: padding,
          backgroundColor: Theme['bg-100']
        },
        style
      ]}
    >
      <FlexView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        padding={['0', 'm', 'm', 'm']}
      >
        <IconLink icon="chevronLeft" size="md" onPress={onClose} />
        <Text variant="paragraph-600">Select token</Text>
        <View style={styles.iconPlaceholder} />
      </FlexView>
      <FlexView>
        <InputText
          value={tokenSearch}
          icon="search"
          placeholder="Search token"
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
          style={styles.input}
        />
        {!isSourceToken && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            fadingEdgeLength={20}
            style={styles.suggestedList}
            contentContainerStyle={styles.suggestedListContent}
          >
            {suggestedList?.map((token, index) => (
              <TokenButton
                key={token.name}
                text={token.symbol}
                imageUrl={token.logoUri}
                onPress={() => onTokenPress(token)}
                style={index !== suggestedList.length - 1 ? styles.suggestedToken : undefined}
              />
            ))}
          </ScrollView>
        )}
      </FlexView>
      <Separator style={styles.suggestedSeparator} color="gray-glass-020" />
      <SectionList
        sections={filteredTokens as SectionListData<SwapTokenWithBalance>[]}
        bounces={false}
        fadingEdgeLength={20}
        contentContainerStyle={styles.tokenList}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            variant="paragraph-500"
            color="fg-200"
            style={[{ backgroundColor: Theme['bg-100'] }, styles.title]}
          >
            {title}
          </Text>
        )}
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
            disabled={item.address === sourceToken?.address}
          />
        )}
      />
    </FlexView>
  );
}
