import { AssetController, AssetUtil } from '@reown/appkit-core-react-native';
import type { AppKitNetwork } from '@reown/appkit-common-react-native';
import {
  BorderRadius,
  FlexView,
  NetworkImage,
  Spacing,
  Text,
  UiUtil,
  useTheme
} from '@reown/appkit-ui-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSnapshot } from 'valtio';

export interface PreviewSendDetailsProps {
  address?: string;
  name?: string;
  activeNetwork?: AppKitNetwork;
  networkFee?: number;
  style?: StyleProp<ViewStyle>;
}

export function PreviewSendDetails({
  address,
  name,
  activeNetwork,
  style
}: PreviewSendDetailsProps) {
  const Theme = useTheme();
  const { networkImages } = useSnapshot(AssetController.state);

  const formattedName = UiUtil.getTruncateString({
    string: name ?? '',
    charsStart: 20,
    charsEnd: 0,
    truncate: 'end'
  });

  const formattedAddress = UiUtil.getTruncateString({
    string: address || '',
    charsStart: 6,
    charsEnd: 8,
    truncate: 'middle'
  });

  const networkImage = AssetUtil.getNetworkImage(activeNetwork, networkImages);

  return (
    <FlexView
      style={[styles.container, { backgroundColor: Theme['gray-glass-002'] }, style]}
      padding="s"
    >
      <Text variant="small-400" color="fg-200" style={styles.title}>
        Details
      </Text>
      <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
        <Text variant="small-400" color="fg-150">
          {formattedName || 'Address'}
        </Text>
        <Text variant="small-400" color="fg-100">
          {formattedAddress}
        </Text>
      </FlexView>
      <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
        <Text variant="small-400" color="fg-150">
          Network
        </Text>
        <NetworkImage imageSrc={networkImage} size="xs" />
      </FlexView>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    borderRadius: BorderRadius.xxs
  },
  title: {
    marginBottom: Spacing.xs
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.s,
    borderRadius: BorderRadius.xxs,
    marginTop: Spacing['2xs']
  },
  networkImage: {
    height: 24,
    width: 24,
    borderRadius: BorderRadius.full
  }
});
