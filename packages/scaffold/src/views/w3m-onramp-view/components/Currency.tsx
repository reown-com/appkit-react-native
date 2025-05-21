import {
  type OnRampFiatCurrency,
  type OnRampCryptoCurrency
} from '@reown/appkit-core-react-native';
import {
  Pressable,
  FlexView,
  Spacing,
  Text,
  useTheme,
  Icon,
  BorderRadius
} from '@reown/appkit-ui-react-native';
import { StyleSheet, Image } from 'react-native';

export const ITEM_HEIGHT = 60;

interface Props {
  onPress: (item: OnRampFiatCurrency | OnRampCryptoCurrency) => void;
  item: OnRampFiatCurrency | OnRampCryptoCurrency;
  selected: boolean;
  title: string;
  subtitle: string;
  testID?: string;
}

export function Currency({ onPress, item, selected, title, subtitle, testID }: Props) {
  const Theme = useTheme();

  const handlePress = () => {
    onPress(item);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}
      backgroundColor="transparent"
      testID={testID}
    >
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between" padding="xs">
        <FlexView flexDirection="row" alignItems="center" justifyContent="flex-start">
          <Image
            source={{ uri: item.symbolImageUrl }}
            style={[styles.logo, { backgroundColor: Theme['fg-100'] }]}
          />
          <FlexView>
            <Text variant="paragraph-500" color="fg-100" numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            <Text variant="small-400" color="fg-150">
              {subtitle}
            </Text>
          </FlexView>
        </FlexView>
        {selected && (
          <Icon name="checkmark" size="md" color="accent-100" style={styles.checkmark} />
        )}
      </FlexView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: ITEM_HEIGHT,
    borderRadius: BorderRadius.s
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs
  },
  checkmark: {
    marginRight: Spacing['2xs']
  },
  selected: {
    borderWidth: 1
  },
  text: {
    flex: 1
  }
});
