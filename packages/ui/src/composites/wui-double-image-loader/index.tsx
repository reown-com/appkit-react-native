import { type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { FlexView } from '../../layout/wui-flex';
import { Image } from '../../components/wui-image';
import { Icon } from '../../components/wui-icon';
import { type IconType } from '../../utils/TypesUtil';
import { WalletImage } from '../wui-wallet-image';
import styles from './styles';
interface Props {
  style?: StyleProp<ViewStyle>;
  leftImage?: string;
  rightImage?: string;
  renderRightPlaceholder?: () => React.ReactElement;
  leftPlaceholderIcon?: IconType;
  rightPlaceholderIcon?: IconType;
  leftItemStyle?: StyleProp<ViewStyle>;
  rightItemStyle?: StyleProp<ViewStyle>;
}

export function DoubleImageLoader({
  style,
  leftImage,
  rightImage,
  renderRightPlaceholder,
  leftPlaceholderIcon = 'mobile',
  rightPlaceholderIcon = 'browser',
  leftItemStyle,
  rightItemStyle
}: Props) {
  const Theme = useTheme();

  return (
    <FlexView flexDirection="row" alignItems="center" justifyContent="center" style={style}>
      <FlexView
        style={[
          styles.itemBorder,
          styles.leftItemBorder,
          {
            backgroundColor: Theme['bg-200']
          },
          leftItemStyle
        ]}
      >
        {leftImage ? (
          <Image
            source={leftImage}
            style={[styles.rightImage, { backgroundColor: Theme['bg-200'] }]}
          />
        ) : (
          <Icon name={leftPlaceholderIcon} size="lg" color="fg-200" />
        )}
      </FlexView>
      <FlexView
        style={[
          styles.itemBorder,
          styles.rightItemBorder,
          {
            backgroundColor: Theme['bg-200']
          },
          rightItemStyle
        ]}
      >
        {rightImage ? (
          <WalletImage imageSrc={rightImage} size="lg" border={false} />
        ) : (
          renderRightPlaceholder?.() ?? (
            <Icon name={rightPlaceholderIcon} size="lg" color="fg-200" />
          )
        )}
      </FlexView>
    </FlexView>
  );
}
