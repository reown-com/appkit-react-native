import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import {
  IconBox,
  Text,
  FlexView,
  Spacing,
  type IconType,
  Button,
  type ColorType
} from '@reown/appkit-ui-react-native';

interface Props {
  icon?: IconType;
  iconColor?: ColorType;
  title?: string;
  description?: string;
  style?: StyleProp<ViewStyle>;
  actionIcon?: IconType;
  actionPress?: () => void;
  actionTitle?: string;
}

export function Placeholder({
  icon,
  iconColor = 'fg-175',
  title,
  description,
  style,
  actionPress,
  actionTitle,
  actionIcon
}: Props) {
  return (
    <FlexView alignItems="center" justifyContent="center" style={[styles.container, style]}>
      {icon && (
        <IconBox icon={icon} size="xl" iconColor={iconColor} background style={styles.icon} />
      )}
      {title && (
        <Text variant="paragraph-500" style={styles.title}>
          {title}
        </Text>
      )}
      {description && (
        <Text variant="small-400" color="fg-200" center>
          {description}
        </Text>
      )}
      {actionPress && (
        <Button
          style={styles.button}
          iconLeft={actionIcon}
          size="sm"
          variant="accent"
          onPress={actionPress}
        >
          {actionTitle ?? ''}
        </Button>
      )}
    </FlexView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200
  },
  icon: {
    marginBottom: Spacing.l
  },
  title: {
    marginBottom: Spacing['2xs']
  },
  button: {
    marginTop: Spacing.m
  }
});
