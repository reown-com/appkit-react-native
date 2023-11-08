import { View, type ImageStyle, type StyleProp } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Image } from '../../components/wui-image';
import { useTheme } from '../../hooks/useTheme';
import { UiUtil } from '../../utils/UiUtil';
import styles from './styles';

export interface AvatarProps {
  imageSrc?: string;
  address?: string;
  style?: StyleProp<ImageStyle>;
  size?: number;
  borderWidth?: number;
}

export function Avatar({ imageSrc, address, style, size = 64, borderWidth = 8 }: AvatarProps) {
  const Theme = useTheme();
  const colors = UiUtil.generateAvatarColors(address);
  const containerSize = size + borderWidth * 2;

  if (imageSrc) {
    return (
      <View
        style={[
          styles.image,
          {
            height: containerSize,
            width: containerSize,
            borderColor: Theme['gray-glass-005'],
            borderWidth
          },
          style
        ]}
      >
        <Image
          source={imageSrc}
          style={[
            styles.image,
            {
              height: size,
              width: size
            }
          ]}
        />
      </View>
    );
  }

  return (
    <Svg width={containerSize} height={containerSize} fill="none" style={style}>
      <Defs>
        <RadialGradient
          id="radial"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform={`translate(${size * 0.75} ${size * 0.35}) scale(${size * 0.75})`}
        >
          <Stop offset="0.52%" stopColor="#FFFFFF" />
          <Stop offset="31.25%" stopColor={colors[0]} />
          <Stop offset="51.56%" stopColor={colors[1]} />
          <Stop offset="65.63%" stopColor={colors[2]} />
          <Stop offset="82.29%" stopColor={colors[3]} />
          <Stop offset="100%" stopColor={colors[4]} />
        </RadialGradient>
      </Defs>
      <Circle cx="50%" cy="50%" r={size / 2} fill="url(#radial)" />
      <Circle
        cx="50%"
        cy="50%"
        r={(size + borderWidth) / 2}
        stroke={Theme['gray-glass-005']}
        strokeWidth={borderWidth}
      />
    </Svg>
  );
}
