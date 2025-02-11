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

export const ITEM_HEIGHT = 45;

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
          backgroundColor: Theme['gray-glass-005'],
          borderColor: selected ? Theme['accent-100'] : Theme['gray-glass-010'],
          ...(selected && styles.selected)
        }
      ]}
    >
      <FlexView flexDirection="row" alignItems="center" justifyContent="flex-start" padding="s">
        <SvgUri
          uri={item.flagImageUrl}
          width={30}
          height={20}
          style={{
            marginRight: Spacing.s
          }}
        />
        <Text
          variant="paragraph-500"
          color="fg-100"
          style={styles.text}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
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
    borderWidth: StyleSheet.hairlineWidth,
    height: ITEM_HEIGHT,
    justifyContent: 'center'
  },
  selected: {
    borderWidth: 1
  },
  text: {
    flex: 1
  },
  checkmark: {
    marginRight: Spacing['2xs']
  }
});
