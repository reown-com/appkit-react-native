import { useSnapshot } from 'valtio';
import { ThemeController, type OnRampPaymentMethod } from '@reown/appkit-core-react-native';
import {
  Pressable,
  FlexView,
  Spacing,
  Text,
  useTheme,
  Image,
  BorderRadius,
  IconBox
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export const ITEM_SIZE = 85;

interface Props {
  onPress: (item: OnRampPaymentMethod) => void;
  item: OnRampPaymentMethod;
  selected: boolean;
  testID?: string;
}

export function PaymentMethod({ onPress, item, selected, testID }: Props) {
  const Theme = useTheme();
  const { themeMode } = useSnapshot(ThemeController.state);

  const handlePress = () => {
    onPress(item);
  };

  return (
    <Pressable
      onPress={handlePress}
      bounceScale={0.96}
      style={styles.container}
      transparent
      pressable={!selected}
      testID={testID}
    >
      <FlexView
        style={[styles.logoContainer, { backgroundColor: Theme['gray-glass-005'] }]}
        alignItems="center"
        justifyContent="center"
      >
        <Image
          source={item.logos[themeMode ?? 'light']}
          style={styles.logo}
          resizeMethod="resize"
          resizeMode="center"
        />
        {selected && (
          <IconBox
            icon="checkmark"
            size="sm"
            background
            backgroundColor="accent-100"
            iconColor="inverse-100"
            style={styles.checkmark}
            testID="payment-method-checkmark"
          />
        )}
      </FlexView>
      <Text variant="tiny-400" color="fg-100" numberOfLines={1} style={styles.text}>
        {item.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_SIZE,
    width: ITEM_SIZE,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing['4xs']
  },
  logo: {
    width: 22,
    height: 22
  },
  checkmark: {
    borderRadius: BorderRadius.full,
    position: 'absolute',
    bottom: 0,
    right: -10
  },
  text: {
    marginTop: Spacing.xs
  }
});
