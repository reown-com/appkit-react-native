import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import useTheme from '../../hooks/useTheme';
import { ButtonType } from '../../utils/TypesUtil';
import { IconBox } from '../wui-icon-box';
import styles, { getThemedStyle, getTextColor } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NetworkButtonProps {
  name: string;
  onPress: () => void;
  imageSrc?: string;
  disabled?: boolean;
  variant?: Exclude<ButtonType, 'accent'>;
}

export function NetworkButton({
  imageSrc,
  name,
  disabled,
  onPress,
  variant = 'fill'
}: NetworkButtonProps) {
  const Theme = useTheme();
  const colorAnimation = useRef(new Animated.Value(0));
  const themedNormalStyle = getThemedStyle(Theme, variant, false, disabled);
  const themedPressedStyle = getThemedStyle(Theme, variant, true, disabled);
  const color = getTextColor(variant, disabled);

  const onPressIn = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: true,
      duration: 200
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: true,
      duration: 200
    }).start();
  };

  const backgroundColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [themedNormalStyle.backgroundColor, themedPressedStyle.backgroundColor]
  });

  const borderColor = colorAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [themedNormalStyle.borderColor, themedPressedStyle.borderColor]
  });

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {imageSrc ? (
        <Image style={[styles.image, disabled && styles.imageDisabled]} source={imageSrc} />
      ) : (
        <IconBox icon="networkPlaceholder" background iconColor={color} size="sm" />
      )}
      <Text style={styles.text} variant="paragraph-600" color={color}>
        {name}
      </Text>
    </AnimatedPressable>
  );
}
