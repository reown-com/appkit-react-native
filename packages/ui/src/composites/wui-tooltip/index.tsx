import { View } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import type { ColorType, PlacementType } from '../../utils/TypesUtil';
import styles from './styles';

export interface TooltipProps {
  message: string;
  placement?: PlacementType;
}

export function Tooltip({ message, placement = 'top' }: TooltipProps) {
  const Theme = useTheme();

  return (
    <>
      <View style={[styles.container, { backgroundColor: Theme['fg-100'] }]}>
        <Text color={'bg-100' as ColorType} variant="small-500">
          {message}
        </Text>
        <Icon
          name="cursor"
          color="fg-100"
          style={[styles.base, styles[placement]]}
          width={12}
          height={4}
        />
      </View>
    </>
  );
}
