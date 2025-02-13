import {
  Pressable,
  FlexView,
  Spacing,
  Text,
  useTheme,
  BorderRadius,
  Icon
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';
import { ITEM_SIZE } from './PaymentMethod';

interface Props {
  onPress: () => void;
  isExpanded: boolean;
}

export function ToggleButton({ onPress, isExpanded }: Props) {
  const Theme = useTheme();

  const handlePress = () => {
    onPress();
  };

  return (
    <Pressable onPress={handlePress} bounceScale={0.96} style={styles.container} transparent>
      <FlexView
        style={[styles.iconContainer, { borderColor: Theme['gray-glass-010'] }]}
        alignItems="center"
        justifyContent="center"
      >
        <Icon name={isExpanded ? 'chevronTop' : 'chevronBottom'} size="sm" />
      </FlexView>
      <Text variant="tiny-400" color="fg-100" numberOfLines={1}>
        {isExpanded ? 'View less' : 'View more'}
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing['4xs'],
    borderWidth: 1
  }
});
