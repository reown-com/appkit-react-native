import { useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleProp, ViewStyle } from 'react-native';
import { ChipType, ColorType, IconType, SizeType } from '../../utils/TypesUtil';
import useTheme from '../../hooks/useTheme';
import { Text } from '../../components/wui-text';
import styles, { getThemedChipStyle, getThemedTextColor } from './styles';
import { Image } from '../../components/wui-image';
import { Icon } from '../../components/wui-icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ChipProps {
  link: string;
  label?: string;
  imageSrc?: string;
  icon?: IconType;
  variant?: ChipType;
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  link,
  imageSrc,
  icon,
  variant = 'fill',
  size = 'md',
  disabled,
  label,
  style
}: ChipProps) {
  const Theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const themedButtonStyle = getThemedChipStyle(Theme, variant, disabled, pressed);
  const themedTextColor = getThemedTextColor(variant, disabled, pressed);
  const iconSize = size === 'md' ? 'sm' : 'xs';

  const onPress = () => {
    Linking.canOpenURL(link).then(supported => {
      if (supported) Linking.openURL(link);
    });
  };

  const onPressIn = () => {
    setPressed(true);
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true
    }).start();
  };

  const onPressOut = () => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true
    }).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      style={[
        styles.container,
        styles[`${size}Chip`],
        { transform: [{ scale }] },
        themedButtonStyle,
        style
      ]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
    >
      {imageSrc && (
        <Image
          style={[
            styles.image,
            styles[`${size}Image`],
            { borderColor: themedButtonStyle.borderColor },
            disabled && styles.disabledImage
          ]}
          source={imageSrc}
        />
      )}
      <Text
        variant={size === 'md' ? 'paragraph-600' : 'small-600'}
        style={[styles.link, { color: Theme[themedTextColor] }]}
      >
        {label || link}
      </Text>
      {icon && (
        <Icon
          name={icon}
          size={iconSize}
          color={themedTextColor as ColorType}
          style={styles.icon}
        />
      )}
    </AnimatedPressable>
  );
}
