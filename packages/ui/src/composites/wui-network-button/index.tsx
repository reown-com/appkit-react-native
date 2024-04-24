import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from '../../components/wui-image';
import { Text } from '../../components/wui-text';
import { useTheme } from '../../hooks/useTheme';
import { IconBox } from '../wui-icon-box';

import styles from './styles';
import useAnimatedValue from '../../hooks/useAnimatedValue';
import { LoadingSpinner } from '../../components/wui-loading-spinner';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface NetworkButtonProps {
  children: string;
  onPress: () => void;
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
}

export function NetworkButton({
  imageSrc,
  imageHeaders,
  disabled,
  onPress,
  style,
  loading,
  children
}: NetworkButtonProps) {
  const Theme = useTheme();
  const textColor = disabled ? 'fg-300' : 'fg-100';

  const { animatedValue, setStartValue, setEndValue } = useAnimatedValue(
    Theme['gray-glass-005'],
    Theme['gray-glass-010']
  );

  const backgroundColor = disabled ? Theme['gray-glass-015'] : animatedValue;

  return (
    <AnimatedPressable
      style={[styles.container, { backgroundColor, borderColor: Theme['gray-glass-005'] }, style]}
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
      <Text style={styles.text} variant="paragraph-600" color={textColor}>
        {children}
      </Text>
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
