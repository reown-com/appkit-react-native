import type { OnRampCountry } from '@reown/appkit-core-react-native';
import {
  Pressable,
  FlexView,
  Spacing,
  Text,
  useTheme,
  Icon,
  BorderRadius
} from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface Props {
  onPress: (item: OnRampCountry) => void;
  item: OnRampCountry;
  selected: boolean;
}

export function Country({ onPress, item, selected }: Props) {
  const Theme = useTheme();

  const handlePress = () => {
    onPress(item);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: selected ? Theme['accent-glass-015'] : Theme['gray-glass-005'],
          borderColor: selected ? Theme['accent-100'] : Theme['gray-glass-010']
        }
      ]}
    >
      <FlexView flexDirection="row" alignItems="center" justifyContent="space-between" padding="s">
        <FlexView flexDirection="row" alignItems="center" justifyContent="flex-start">
          <SvgUri
            uri={item.flagImageUrl}
            width={30}
            height={20}
            style={{
              marginRight: Spacing.s
            }}
          />
          <Text variant="medium-400" color="fg-100">
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
  checkmark: {
    marginRight: Spacing['2xs']
  }
});
