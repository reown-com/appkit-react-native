import { NumberUtil } from '@reown/appkit-common-react-native';
import { type OnRampQuote } from '@reown/appkit-core-react-native';
import {
  Pressable,
  FlexView,
  Image,
  Spacing,
  Text,
  Tag,
  useTheme,
  BorderRadius
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

interface Props {
  item: OnRampQuote;
  isBestDeal?: boolean;
  logoURL?: string;
  onQuotePress: (item: OnRampQuote) => void;
  selected?: boolean;
}

export const ITEM_HEIGHT = 60;

export function Quote({ item, logoURL, onQuotePress, selected, isBestDeal }: Props) {
  const Theme = useTheme();
  //TODO: Add logo placeholder

  return (
    <Pressable
      style={[styles.container, selected && { borderColor: Theme['accent-100'] }]}
      onPress={() => onQuotePress(item)}
      backgroundColor="transparent"
      pressable={!selected}
    >
      <FlexView justifyContent="space-between" alignItems="center" flexDirection="row" padding="m">
        <FlexView flexDirection="row" alignItems="center">
          {logoURL && <Image source={logoURL} style={styles.logo} />}
          <FlexView>
            <Text variant="paragraph-600" style={styles.providerText}>
              {item.serviceProvider?.toLowerCase()}
            </Text>
            <FlexView flexDirection="row" alignItems="center" justifyContent="center">
              <Text variant="small-400" style={styles.amountText}>
                {NumberUtil.roundNumber(item.destinationAmount, 6, 5)}{' '}
                {item.destinationCurrencyCode}
              </Text>
              <Text variant="small-400" color="fg-175" style={styles.amountText}>
                {' ≈ '}
                {NumberUtil.roundNumber(item.sourceAmountWithoutFees, 2, 2)}{' '}
                {item.sourceCurrencyCode}
              </Text>
            </FlexView>
          </FlexView>
        </FlexView>
        {isBestDeal && (
          <Tag variant="main" style={styles.dealTag}>
            Best Deal
          </Tag>
        )}
      </FlexView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.s,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    borderColor: 'transparent'
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius['3xs'],
    marginRight: Spacing.xs
  },
  providerText: {
    textTransform: 'capitalize',
    marginBottom: Spacing['3xs']
  },
  dealTag: {
    padding: Spacing['3xs']
  },
  amountText: {
    textAlign: 'right'
  }
});
