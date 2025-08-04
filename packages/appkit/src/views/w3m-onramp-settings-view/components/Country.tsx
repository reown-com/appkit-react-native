import { type OnRampCountry } from '@reown/appkit-common-react-native';
import {
  Pressable,
  FlexView,
  Spacing,
  Text,
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

export const ITEM_HEIGHT = 60;

export function Country({ onPress, item, selected }: Props) {
  const handlePress = () => {
    onPress(item);
  };

  return (
    <Pressable onPress={handlePress} style={styles.container} backgroundColor="transparent">
      <FlexView flexDirection="row" alignItems="center" justifyContent="flex-start" padding="s">
        <FlexView style={styles.imageContainer}>
          {item.flagImageUrl && SvgUri ? <SvgUri uri={item.flagImageUrl} width={36} height={36} /> : null}
        </FlexView>
        <FlexView style={styles.textContainer}>
          <Text variant="paragraph-400" color="fg-100" numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          <Text variant="small-400" color="fg-150">
            {item.countryCode}
          </Text>
        </FlexView>
        {selected ? <Icon name="checkmark" size="md" color="accent-100" style={styles.checkmark} /> : null}
      </FlexView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.s,
    height: ITEM_HEIGHT,
    justifyContent: 'center'
  },
  imageContainer: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginRight: Spacing.xs
  },
  textContainer: {
    flex: 1
  },
  checkmark: {
    marginRight: Spacing['2xs']
  }
});
