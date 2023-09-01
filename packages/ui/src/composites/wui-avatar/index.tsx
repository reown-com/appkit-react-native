import { type ImageStyle, type StyleProp, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Image } from '../../components/wui-image';
import useTheme from '../../hooks/useTheme';
import { UiUtil } from '../../utils/UiUtil';
import styles from './styles';

export interface AvatarProps {
  imageSrc?: string;
  address?: string;
  style?: StyleProp<ImageStyle>;
}

export function Avatar({ imageSrc, address, style }: AvatarProps) {
  const Theme = useTheme();
  const colors = UiUtil.generateAvatarColors(address);

  if (imageSrc) {
    return (
      <Image
        source={imageSrc}
        style={[styles.container, styles.image, { borderColor: Theme['overlay-005'] }, style]}
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 80 80" fill="none">
        <G clip-path="url(#clip)">
          <Circle cx="40" cy="40" r="32" fill="url(#radial)" />
          <Circle cx="40" cy="40" r="31.5" stroke={Theme['overlay-005']} />
        </G>
        <Rect
          x="4"
          y="4"
          width="72"
          height="72"
          rx="34"
          stroke={Theme['overlay-005']}
          strokeWidth="8"
        />
        <Defs>
          <RadialGradient
            id="radial"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(49.5736 23.5888) scale(48.186)"
          >
            <Stop offset="0.00520833" stopColor="#FFFFFF" stopOpacity={0.8} />
            <Stop offset="0.3125" stopColor={colors[0]} />
            <Stop offset="0.515625" stopColor={colors[1]} />
            <Stop offset="0.65625" stopColor={colors[2]} />
            <Stop offset="0.822917" stopColor={colors[3]} />
            <Stop offset="1" stopColor={colors[4]} />
          </RadialGradient>
          <ClipPath id="clip">
            <Rect x="8" y="8" width="64" height="64" rx="30" fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
}
