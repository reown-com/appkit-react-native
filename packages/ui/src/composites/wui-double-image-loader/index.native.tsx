import { Animated, useAnimatedValue, type StyleProp, type ViewStyle } from 'react-native';

import { useEffect } from 'react';
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
  const leftPosition = useAnimatedValue(10);
  const rightPosition = useAnimatedValue(-10);

  const animateLeft = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftPosition, {
          toValue: -5,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(leftPosition, {
          toValue: 10,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const animateRight = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightPosition, {
          toValue: 5,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(rightPosition, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  useEffect(() => {
    animateLeft();
    animateRight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FlexView flexDirection="row" alignItems="center" justifyContent="center" style={style}>
      <Animated.View
        style={[
          styles.itemBorder,
          styles.leftItemBorder,
          {
            transform: [{ translateX: leftPosition }],
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
      </Animated.View>
      <Animated.View
        style={[
          styles.itemBorder,
          styles.rightItemBorder,
          {
            transform: [{ translateX: rightPosition }],
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
      </Animated.View>
    </FlexView>
  );
}
