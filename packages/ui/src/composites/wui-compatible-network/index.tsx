import { Text } from '../../components/wui-text';
import { NetworkImage } from '../wui-network-image';
import { FlexView } from '../../layout/wui-flex';
import { ListItem } from '../wui-list-item';
import { StyleSheet } from 'react-native';

export interface CompatibleNetworkProps {
  text: string;
  onPress: () => void;
  networkImages: string[];
  imageHeaders: Record<string, string>;
}

export function CompatibleNetwork({
  text,
  onPress,
  networkImages,
  imageHeaders
}: CompatibleNetworkProps) {
  return (
    <ListItem
      onPress={onPress}
      style={styles.container}
      contentStyle={styles.contentContainer}
      chevron
    >
      <Text color="fg-200" variant="small-400">
        {text}
      </Text>
      <FlexView flexDirection="row" justifyContent="center" alignItems="center">
        {networkImages?.map((image, index) => (
          <NetworkImage size="sm" key={index} imageSrc={image} imageHeaders={imageHeaders} />
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
    flexDirection: 'row'
  }
});
