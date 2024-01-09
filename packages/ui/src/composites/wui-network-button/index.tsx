import { useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import type { ButtonType } from '../../utils/TypesUtil';
import { IconBox } from '../wui-icon-box';

import styles, { getThemedStyle, getTextColor } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NetworkButtonProps {
  children: string;
  onPress: () => void;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  disabled?: boolean;
  variant?: Exclude<ButtonType, 'accent'>;
  style?: StyleProp<ViewStyle>;
}

export function NetworkButton({
  imageSrc,
  imageHeaders,
  disabled,
  onPress,
  variant = 'fill',
  style,
  children
}: NetworkButtonProps) {
  const Theme = useTheme();
  const colorAnimation = useRef(new Animated.Value(0));
  const themedNormalStyle = getThemedStyle(Theme, variant, false, disabled);
  const themedPressedStyle = getThemedStyle(Theme, variant, true, disabled);
  const color = getTextColor(variant, disabled);

  const onPressIn = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 1,
      useNativeDriver: false,
      duration: 200
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(colorAnimation.current, {
      toValue: 0,
      useNativeDriver: false,
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
      style={[styles.container, { backgroundColor, borderColor }, style]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      {imageSrc ? (
        <Image
          style={[
            styles.image,
            { borderColor: Theme['gray-glass-010'] },
            disabled && styles.imageDisabled
          ]}
          source={imageSrc}
          headers={imageHeaders}
        />
      ) : (
        <IconBox icon="networkPlaceholder" background iconColor={color} size="sm" />
      )}
      <Text style={styles.text} variant="paragraph-600" color={color}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}
