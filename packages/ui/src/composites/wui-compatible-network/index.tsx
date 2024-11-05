import { Text } from '../../components/wui-text';
import { NetworkImage } from '../wui-network-image';
import { FlexView } from '../../layout/wui-flex';
import { ListItem } from '../wui-list-item';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface CompatibleNetworkProps {
  text: string;
  onPress: () => void;
  networkImages: string[];
  imageHeaders: Record<string, string>;
  style?: StyleProp<ViewStyle>;
}

export function CompatibleNetwork({
  text,
  onPress,
  networkImages,
  imageHeaders,
  style
}: CompatibleNetworkProps) {
  const Theme = useTheme();

  return (
    <ListItem
      onPress={onPress}
      style={[styles.container, style]}
      contentStyle={styles.contentContainer}
      chevron
    >
      <Text color="fg-200" variant="small-400">
        {text}
      </Text>
      <FlexView flexDirection="row" justifyContent="center" alignItems="center">
        {networkImages?.map((image, index) => (
          <NetworkImage
            size="xs"
            key={image}
            imageSrc={image}
            imageHeaders={imageHeaders}
            borderColor={Theme['bg-200']}
            borderWidth={2}
            style={[styles.item, { zIndex: networkImages.length - index }]}
          />
        ))}
      </FlexView>
    </ListItem>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 0
  },
  item: {
    marginLeft: -5
  }
});
