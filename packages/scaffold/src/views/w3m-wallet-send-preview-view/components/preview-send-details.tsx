import { BorderRadius, FlexView, Spacing, Text, useTheme } from '@reown/appkit-ui-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export interface PreviewSendDetailsProps {
  value?: string;
  style?: StyleProp<ViewStyle>;
}

export function PreviewSendDetails({ value, style }: PreviewSendDetailsProps) {
  const Theme = useTheme();

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
      </FlexView>
      <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
        <Text variant="small-400" color="fg-150">
          Address
        </Text>
      </FlexView>
      <FlexView style={[styles.item, { backgroundColor: Theme['gray-glass-002'] }]}>
        <Text variant="small-400" color="fg-150">
          Network
        </Text>
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
  }
});
