import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { FlexView } from '../../layout/wui-flex';
import { UiUtil } from '../../utils/UiUtil';
import styles from './styles';

export interface ListTokenProps {
  imageSrc: string;
  name: string;
  value?: number;
  amount?: string;
  currency: string;
}

export function ListToken({ imageSrc, name, value, amount, currency }: ListTokenProps) {
  const Theme = useTheme();

  return (
    <FlexView
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding={['2xs', 'm', '2xs', 'xs']}
    >
      <FlexView flexDirection="row" alignItems="center">
        {imageSrc ? (
          <Image
            source={imageSrc}
            style={[styles.image, { backgroundColor: Theme['gray-glass-005'] }]}
          />
        ) : (
          <FlexView
            style={[styles.image, { backgroundColor: Theme['gray-glass-005'] }]}
            alignItems="center"
            justifyContent="center"
          >
            <Icon name="coinPlaceholder" size="lg" color="fg-200" />
          </FlexView>
        )}

        <FlexView padding={['0', 's', '0', 's']}>
          <Text color="fg-100" variant="paragraph-500">
            {name}
          </Text>
          <Text variant="small-400" color="fg-200">
            {UiUtil.formatNumberToLocalString(amount, 4)} {currency}
          </Text>
        </FlexView>
      </FlexView>
      <Text color="fg-100" variant="paragraph-500">
        ${value?.toFixed(2) || '0.00'}
      </Text>
    </FlexView>
  );
}
