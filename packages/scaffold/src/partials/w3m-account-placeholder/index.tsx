import { StyleSheet } from 'react-native';
import { IconBox, Text, FlexView, Spacing, type IconType } from '@web3modal/ui-react-native';

interface Props {
  icon: IconType;
  title: string;
  description: string;
}

export function AccountPlaceholder({ icon, title, description }: Props) {
  return (
    <FlexView alignItems="center" justifyContent="center">
      <IconBox icon={icon} size="lg" iconColor="fg-175" background />
      <Text variant="paragraph-500" style={styles.title}>
        {title}
      </Text>
      <Text variant="small-400" color="fg-200" center style={styles.description}>
        {description}
      </Text>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs
  },
  description: {
    maxWidth: '50%'
  }
});
