import { memo, useMemo } from 'react';
import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../components/wui-text';
import { IconBox } from '../wui-icon-box';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { useTheme } from '../../hooks/useTheme';
import type { CardSelectType } from '../../utils/TypesUtil';
import { NetworkImage } from '../wui-network-image';
import { WalletImage } from '../wui-wallet-image';
import styles, { getBackgroundColor, ITEM_HEIGHT, ITEM_WIDTH } from './styles';
import { UiUtil } from '../../utils/UiUtil';
import { FlexView } from '../../layout/wui-flex';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CardSelectHeight = ITEM_HEIGHT;
export const CardSelectWidth = ITEM_WIDTH;

export interface CardSelectProps {
  name: string;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  disabled?: boolean;
  installed?: boolean;
  selected?: boolean;
  type?: CardSelectType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function _CardSelect({
  name,
  type = 'wallet',
  imageSrc,
  imageHeaders,
  onPress,
  disabled,
  installed,
  selected,
  style,
  testID
}: CardSelectProps) {
  const Theme = useTheme();
  const normalbackgroundColor = getBackgroundColor({ selected, disabled, pressed: false });
  const pressedBackgroundColor = getBackgroundColor({ selected, disabled, pressed: true });
  const Image = useMemo(() => (type === 'wallet' ? WalletImage : NetworkImage), [type]);

  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme[normalbackgroundColor],
    Theme[pressedBackgroundColor]
  );

  const textColor = disabled ? 'fg-300' : selected ? 'accent-100' : 'fg-100';

  return (
    <FlexView style={style} alignItems="center" justifyContent="center">
      <AnimatedPressable
        onPress={onPress}
        onPressIn={setEndValue}
        onPressOut={setStartValue}
        disabled={disabled}
        style={[styles.container, { backgroundColor: animatedValue }]}
        testID={testID}
      >
        <View>
          <Image
            imageSrc={imageSrc}
            imageHeaders={imageHeaders}
            size="md"
            style={disabled ? styles.disabledImage : null}
            selected={selected}
            disabled={disabled}
          />
          {installed ? (
            <IconBox
              icon="checkmark"
              iconSize="xs"
              iconColor={'success-100'}
              border
              borderSize={6}
              borderColor="bg-150"
              background
              backgroundColor="icon-box-bg-success-100"
              size="sm"
              style={styles.installedBox}
            />
          ) : null}
        </View>
        <Text variant="tiny-500" color={textColor} style={styles.text} numberOfLines={1}>
          {UiUtil.getWalletName(name)}
        </Text>
      </AnimatedPressable>
    </FlexView>
  );
}

export const CardSelect = memo(_CardSelect, (prevProps, nextProps) => {
  return prevProps.name === nextProps.name && prevProps.imageSrc === nextProps.imageSrc;
});
