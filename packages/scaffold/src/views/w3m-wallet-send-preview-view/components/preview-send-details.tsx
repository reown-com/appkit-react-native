import { AssetUtil, type CaipNetwork } from '@reown/appkit-core-react-native';
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

export interface PreviewSendDetailsProps {
  address?: string;
  caipNetwork?: CaipNetwork;
  networkFee?: number;
  style?: StyleProp<ViewStyle>;
}

export function PreviewSendDetails({
  address,
  caipNetwork,
  networkFee,
  style
}: PreviewSendDetailsProps) {
  const Theme = useTheme();

  const formattedAddress = UiUtil.getTruncateString({
    string: address ? address : '',
    charsStart: 6,
    charsEnd: 8,
    truncate: 'middle'
  });

  const networkImage = AssetUtil.getNetworkImage(caipNetwork);

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
          Network cost
        </Text>
        <Text variant="small-400" color="fg-100">
          ${UiUtil.formatNumberToLocalString(networkFee, 2)}
        </Text>
      </FlexView>
      <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
        <Text variant="small-400" color="fg-150">
          Address
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
