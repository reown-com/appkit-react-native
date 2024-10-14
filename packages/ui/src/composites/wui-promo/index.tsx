import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { FlexView } from '../../layout/wui-flex';

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
        style={{
          backgroundColor: Theme['gray-glass-090'],
          borderRadius: 100
        }}
      >
        <Text variant="small-600" color="bg-100">
          {text}
        </Text>
        <Icon style={{ marginLeft: 6 }} name="arrowRight" color="bg-100" size="xs" />
      </FlexView>
    </Pressable>
  );
}
