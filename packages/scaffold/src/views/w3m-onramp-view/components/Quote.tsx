import { useSnapshot } from 'valtio';
import {
  ThemeController,
  type OnRampQuote,
  type OnRampServiceProvider
} from '@reown/appkit-core-react-native';
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
  logoURL: string;
  onQuotePress: (item: OnRampQuote) => void;
  selected?: boolean;
}

export const ITEM_HEIGHT = 60;

export function Quote({ item, logoURL, onQuotePress, selected }: Props) {
  const Theme = useTheme();

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: Theme['gray-glass-005'],
          borderColor: selected ? Theme['accent-100'] : Theme['gray-glass-010']
        }
      ]}
      onPress={() => onQuotePress(item)}
    >
      <FlexView justifyContent="space-between" alignItems="center" flexDirection="row" padding="m">
        <FlexView flexDirection="row" alignItems="center">
          <Image source={logoURL} style={styles.logo} />
          <FlexView>
            <Text variant="paragraph-600" style={styles.providerText}>
              {item.serviceProvider?.toLowerCase()}
            </Text>
            {item.lowKyc && (
              <Tag variant="main" style={styles.kycTag}>
                Low KYC
              </Tag>
            )}
          </FlexView>
        </FlexView>
        <FlexView justifyContent="center">
          <Text variant="paragraph-500" style={styles.amountText}>
            {item.destinationAmount} {item.destinationCurrencyCode}
          </Text>
          <Text variant="small-500" color="fg-175" style={styles.amountText}>
            ≈ {item.sourceAmountWithoutFees} {item.sourceCurrencyCode}
          </Text>
        </FlexView>
      </FlexView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BorderRadius['3xs'],
    height: ITEM_HEIGHT,
    justifyContent: 'center'
  },
  logo: {
    height: 25,
    width: 25,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.s
  },
  providerText: {
    textTransform: 'capitalize',
    marginBottom: Spacing['3xs']
  },
  kycTag: {
    padding: Spacing['3xs'],
    alignItems: 'center'
  },
  amountText: {
    textAlign: 'right'
  }
});
