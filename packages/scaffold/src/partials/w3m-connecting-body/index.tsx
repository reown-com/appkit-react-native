import { StyleSheet } from 'react-native';
import { FlexView, Spacing, Text } from '@reown/ui-react-native';

export * from './utils';

export interface ConnectingBodyProps {
  title: string;
  description?: string;
}

export function ConnectingBody({ title, description }: ConnectingBodyProps) {
  return (
    <FlexView padding={['3xs', '2xl', '0', '2xl']} alignItems="center" style={styles.textContainer}>
      <Text variant="paragraph-500">{title}</Text>
      {description && (
        <Text center variant="small-400" color="fg-200" style={styles.descriptionText}>
          {description}
        </Text>
      )}
    </FlexView>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    marginVertical: Spacing.xs
  },
  descriptionText: {
    marginTop: Spacing.xs,
    marginHorizontal: Spacing['3xl']
  }
});
