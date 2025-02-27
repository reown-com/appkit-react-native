import { NumberUtil } from '@reown/appkit-common-react-native';
import { type OnRampQuote } from '@reown/appkit-core-react-native';
import {
  FlexView,
  Image,
  Spacing,
  Text,
  Tag,
  useTheme,
  BorderRadius,
  ListItem
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

interface Props {
  item: OnRampQuote;
  isBestDeal?: boolean;
  tagText?: string;
  logoURL?: string;
  onQuotePress: (item: OnRampQuote) => void;
  selected?: boolean;
}

export const ITEM_HEIGHT = 60;

export function Quote({ item, logoURL, onQuotePress, selected, tagText }: Props) {
  const Theme = useTheme();

  return (
    <ListItem
      style={[styles.container, selected && { borderColor: Theme['accent-100'] }]}
      onPress={() => onQuotePress(item)}
      chevron
    >
      <FlexView justifyContent="space-between" alignItems="center" flexDirection="row">
        <FlexView flexDirection="row" alignItems="center">
          {logoURL ? (
            <Image source={logoURL} style={styles.logo} />
          ) : (
            <FlexView
              style={[styles.logo, { backgroundColor: Theme['gray-glass-005'] }]}
              justifyContent="center"
              alignItems="center"
            />
          )}
          <FlexView flexDirection="column">
            <FlexView flexDirection="row" alignItems="center" margin={['0', '0', '4xs', '0']}>
              <Text variant="paragraph-500" style={styles.providerText}>
                {item.serviceProvider?.toLowerCase()}
              </Text>
              {tagText && (
                <Tag variant="main" style={styles.tag}>
                  {tagText}
                </Tag>
              )}
            </FlexView>
            <FlexView flexDirection="row" alignItems="center">
              <Text variant="tiny-500" style={styles.amountText}>
                {NumberUtil.roundNumber(item.destinationAmount, 6, 5)}{' '}
                {item.destinationCurrencyCode}
              </Text>
              <Text variant="tiny-500" color="fg-175" style={styles.amountText}>
                {' '}
                {NumberUtil.roundNumber(item.sourceAmountWithoutFees, 2, 2)}{' '}
                {item.sourceCurrencyCode}
              </Text>
            </FlexView>
          </FlexView>
        </FlexView>
      </FlexView>
    </ListItem>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: StyleSheet.hairlineWidth,
    // borderColor: 'transparent',
    height: ITEM_HEIGHT,
    paddingLeft: 0
  },
  logo: {
    height: 40,
    width: 40,
    borderRadius: BorderRadius['3xs'],
    marginRight: Spacing.xs
  },
  providerText: {
    textTransform: 'capitalize'
  },
  tag: {
    padding: Spacing['3xs'],
    marginLeft: Spacing['2xs']
  },
  amountText: {
    textAlign: 'right'
  }
});
