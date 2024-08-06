import { Animated, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { IconBox } from '../wui-icon-box';
import { LoadingSpinner } from '../../components/wui-loading-spinner';
import useAnimatedValue from '../../hooks/useAnimatedValue';

import styles from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NetworkButtonProps {
  children: string | React.ReactNode;
  onPress: () => void;
  background?: boolean;
  disabled?: boolean;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NetworkButton({
  children,
  onPress,
  background = true,
  disabled,
  imageSrc,
  imageHeaders,
  loading,
  style
}: NetworkButtonProps) {
  const Theme = useTheme();
  const textColor = disabled ? 'fg-300' : 'fg-100';

  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    background ? Theme['gray-glass-005'] : 'transparent',
    Theme['gray-glass-010']
  );

  const backgroundColor = disabled ? Theme['gray-glass-015'] : animatedValue;
  const borderColor = background ? Theme['gray-glass-005'] : 'transparent';

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor, borderColor }, style]}
      onPress={onPress}
      onPressIn={setEndValue}
      onPressOut={setStartValue}
      disabled={disabled}
    >
      <LoaderComponent loading={loading} />
      <ImageComponent
        loading={loading}
        disabled={disabled}
        imageSrc={imageSrc}
        imageHeaders={imageHeaders}
        borderColor={Theme['gray-glass-005']}
      />
      {typeof children === 'string' ? (
        <Text style={styles.children} variant="paragraph-600" color={textColor}>
          {children}
        </Text>
      ) : (
        <View style={styles.children}>{children}</View>
      )}
    </AnimatedPressable>
  );
}

function LoaderComponent({ loading }: { loading?: boolean }) {
  if (!loading) return null;

  return <LoadingSpinner size="md" style={styles.loader} />;
}

function ImageComponent({
  loading,
  disabled,
  imageSrc,
  imageHeaders,
  borderColor
}: {
  loading?: boolean;
  disabled?: boolean;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  borderColor: string;
}) {
  if (loading) return null;

  const textColor = disabled ? 'fg-300' : 'fg-100';
  if (!imageSrc) {
    return <IconBox icon="networkPlaceholder" background iconColor={textColor} size="sm" />;
  }

  return (
    <Image
      style={[styles.image, { borderColor }, disabled && styles.imageDisabled]}
      source={imageSrc}
      headers={imageHeaders}
    />
  );
}
