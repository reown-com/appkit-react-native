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

export const ITEM_SIZE = 80;

interface Props {
  onPress: (item: OnRampPaymentMethod) => void;
  item: OnRampPaymentMethod;
  selected: boolean;
}

export function PaymentMethod({ onPress, item, selected }: Props) {
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
            style={styles.checkmark}
          />
        )}
      </FlexView>
      <Text variant="tiny-400" color="fg-100" numberOfLines={1}>
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
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing['4xs']
  },
  logo: {
    width: 16,
    height: 16
  },
  checkmark: {
    borderRadius: BorderRadius.full,
    position: 'absolute',
    bottom: 0,
    right: -10
  }
});
