import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { FlexView } from '../../layout/wui-flex';
import { BorderRadius, Spacing } from '../../utils/ThemeUtil';

export interface PromoProps {
  text: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function Promo({ text, style, onPress }: PromoProps) {
  const Theme = useTheme();

  return (
    <Pressable style={style} onPress={onPress}>
      <FlexView
        alignItems="center"
        justifyContent="center"
        flexDirection="row"
        padding={['xs', 'xs', 'xs', 'm']}
        style={[styles.container, { backgroundColor: Theme['gray-glass-090'] }]}
      >
        <Text variant="small-600" color="bg-100">
          {text}
        </Text>
        <Icon style={styles.icon} name="arrowRight" color="bg-100" size="xs" />
      </FlexView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full
  },
  icon: {
    marginLeft: Spacing['2xs']
  }
});
