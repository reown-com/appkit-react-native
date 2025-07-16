import { Path, Svg, Image, Defs, Pattern, G } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';
import NetworkPlaceholderSvg from '../../assets/svg/NetworkPlaceholder';
import { PathLg, PathNormal, PathSmall, PathXS } from './styles';

export interface NetworkImageProps {
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  selected?: boolean;
  size?: Exclude<SizeType, 'xl' | 'xxs'>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  borderWidth?: number;
}

const sizeToPath = {
  lg: PathLg,
  md: PathNormal,
  sm: PathSmall,
  xs: PathXS
};

const sizeToHeight = {
  lg: 96,
  md: 56,
  sm: 40,
  xs: 20
};

const sizeToIconSize = {
  lg: 24,
  md: 16,
  sm: 14,
  xs: 12
};

export function NetworkImage({
  imageSrc,
  imageHeaders,
  disabled,
  selected,
  size = 'md',
  style,
  borderColor,
  borderWidth = 1
}: NetworkImageProps) {
  const Theme = useTheme();
  const svgStroke = selected ? Theme['accent-100'] : Theme['gray-glass-010'];
  const opacity = disabled ? 0.5 : 1;
  const containerSize = sizeToHeight[size];
  const iconSize = sizeToIconSize[size];

  return (
    <Svg
      width={containerSize}
      height={containerSize}
      stroke={borderColor ?? svgStroke}
      strokeWidth={borderWidth}
      style={style}
    >
      {imageSrc ? (
        <>
          <Defs>
            <Pattern
              id="image-pattern"
              width={containerSize}
              height={containerSize}
              patternUnits="userSpaceOnUse"
            >
              <Image
                height={containerSize}
                width={containerSize}
                opacity={opacity}
                href={{ uri: imageSrc, headers: imageHeaders }}
              />
            </Pattern>
          </Defs>
          <Path d={sizeToPath[size]} opacity={opacity} fill="url(#image-pattern)" />
        </>
      ) : (
        <>
          <Path d={sizeToPath[size]} opacity={opacity} fill={Theme['gray-glass-005']} />
          <G
            transform={`translate(${(containerSize - iconSize) / 2}, ${
              (containerSize - iconSize) / 2
            })`}
          >
            <NetworkPlaceholderSvg
              fill={selected ? Theme['accent-100'] : Theme['fg-200']}
              width={iconSize}
              height={iconSize}
            />
          </G>
        </>
      )}
    </Svg>
  );
}
