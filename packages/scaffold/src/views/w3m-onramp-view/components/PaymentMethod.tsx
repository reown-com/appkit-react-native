import { useSnapshot } from 'valtio';
import { ThemeController, type OnRampPaymentMethod } from '@reown/appkit-core-react-native';
import {
  Pressable,
  FlexView,
  Spacing,
  Text,
  useTheme,
  Icon,
  Image,
  BorderRadius
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

interface Props {
  onPress: (item: OnRampPaymentMethod) => void;
  item: OnRampPaymentMethod;
  selected: boolean;
}

export function PaymentMethod({ onPress, item, selected }: Props) {
  const Theme = useTheme();
  const { themeMode } = useSnapshot(ThemeController.state);
  const logoURL = themeMode === 'dark' ? item.logos.dark : item.logos.light;

  const handlePress = () => {
    onPress(item);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: Theme['gray-glass-005'],
          borderColor: selected ? Theme['accent-100'] : Theme['gray-glass-010']
        }
      ]}
    >
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between" padding="xs">
        <FlexView flexDirection="row" alignItems="center" justifyContent="flex-start" padding="2xs">
          <Image source={logoURL} style={styles.logo} resizeMethod="resize" resizeMode="center" />
          <Text variant="paragraph-500" color="fg-100">
            {item.name}
          </Text>
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
    borderRadius: BorderRadius['3xs'],
    borderWidth: StyleSheet.hairlineWidth
  },
  logo: {
    width: 22,
    height: 22,
    marginRight: Spacing.s
  },
  checkmark: {
    marginRight: Spacing['2xs']
  }
});
