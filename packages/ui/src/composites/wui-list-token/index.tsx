import { Pressable } from 'react-native';
import { Icon } from '../../components/wui-icon';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { FlexView } from '../../layout/wui-flex';
import { UiUtil } from '../../utils/UiUtil';
import { Spacing } from '../../utils/ThemeUtil';
import styles from './styles';

const ListTokenHeight = 52;
export const ListTokenTotalHeight = ListTokenHeight + Spacing['2xs'];

export interface ListTokenProps {
  imageSrc: string;
  networkSrc?: string;
  name: string;
  value?: number;
  amount?: string;
  currency: string;
  onPress?: () => void;
}

export function ListToken({
  imageSrc,
  networkSrc,
  name,
  value,
  amount,
  currency,
  onPress
}: ListTokenProps) {
  const Theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <FlexView
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        padding={['2xs', 'm', '2xs', 'xs']}
      >
        <FlexView flexDirection="row" alignItems="center" style={{ height: ListTokenHeight }}>
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
          <FlexView
            alignItems="center"
            justifyContent="center"
            style={[
              styles.networkImageContainer,
              { borderColor: Theme['bg-100'], backgroundColor: Theme['bg-200'] }
            ]}
          >
            {networkSrc ? (
              <Image source={networkSrc} style={styles.networkImage} />
            ) : (
              <Icon name="networkPlaceholder" size="xxs" color="fg-200" />
            )}
          </FlexView>
          <FlexView padding={['0', 's', '0', 's']}>
            <Text color="fg-100" variant="paragraph-500">
              {UiUtil.getTruncateString({
                string: name,
                charsStart: 15,
                charsEnd: 0,
                truncate: 'end'
              })}
            </Text>
            <Text variant="small-400" color="fg-200">
              {UiUtil.formatNumberToLocalString(amount, 4)}{' '}
              {UiUtil.getTruncateString({
                string: currency,
                charsStart: 8,
                charsEnd: 0,
                truncate: 'end'
              })}
            </Text>
          </FlexView>
        </FlexView>
        <Text color="fg-100" variant="paragraph-500">
          ${value?.toFixed(2) ?? '0.00'}
        </Text>
      </FlexView>
    </Pressable>
  );
}
