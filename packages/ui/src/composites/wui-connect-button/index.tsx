import { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps as NativeProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';

import styles, { getThemedButtonStyle, getThemedTextStyle } from './styles';
import { LoadingSpinner } from '../../components/wui-loading-spinner';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ConnectButtonProps = NativeProps & {
  size?: Exclude<SizeType, 'lg' | 'xs' | 'xxs'>;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
};

export function ConnectButton({
  children,
  size = 'md',
  onPress,
  style,
  loading,
  ...rest
}: ConnectButtonProps) {
  const Theme = useTheme();
  const themedTextStyle = getThemedTextStyle(Theme, loading);
  const colorAnimation = useRef(new Animated.Value(0));

  const themedNormalStyle = getThemedButtonStyle(Theme, loading, false);
  const themedPressedStyle = getThemedButtonStyle(Theme, loading, true);

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

  const loadingTemplate = () => {
    if (!loading) return null;

    return <LoadingSpinner size={size} style={styles.loader} />;
  };

  return (
    <AnimatedPressable
      disabled={loading}
      style={[styles.button, styles[`${size}Button`], { backgroundColor, borderColor }, style]}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      {...rest}
    >
      {loadingTemplate()}
      <Text variant={size === 'md' ? 'paragraph-500' : 'small-600'} style={themedTextStyle}>
        {children}
      </Text>
    </AnimatedPressable>
  );
}
