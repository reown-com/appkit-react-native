import { BorderRadius, FlexView, Text, useTheme } from '@reown/appkit-ui-react-native';
import { StyleSheet } from 'react-native';

export interface PreviewSendPillProps {
  text: string;
  children: React.ReactNode;
}

export function PreviewSendPill({ text, children }: PreviewSendPillProps) {
  const Theme = useTheme();

  return (
    <FlexView
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      padding={['xs', 's', 'xs', 's']}
      style={[
        styles.pill,
        { backgroundColor: Theme['gray-glass-002'], borderColor: Theme['gray-glass-010'] }
      ]}
    >
      <Text variant="large-500" color="fg-100">
        {text}
      </Text>
      {children}
    </FlexView>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: BorderRadius.full,
    borderWidth: 1
  }
});
