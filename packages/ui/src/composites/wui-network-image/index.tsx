import { Path, Svg, Image, Defs, Pattern } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';
import { PathLg, PathNormal, PathSmall } from './styles';
import type { StyleProp, ViewStyle } from 'react-native';

export interface NetworkImageProps {
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  selected?: boolean;
  size?: Exclude<SizeType, 'xl' | 'xs' | 'xxs'>;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeToPath = {
  lg: PathLg,
  md: PathNormal,
  sm: PathSmall
};

const sizeToHeight = {
  lg: 96,
  md: 56,
  sm: 20
};

export function NetworkImage({
  imageSrc,
  imageHeaders,
  disabled,
  selected,
  size = 'md',
  style
}: NetworkImageProps) {
  const Theme = useTheme();
  const svgStroke = selected ? Theme['accent-100'] : Theme['gray-glass-010'];
  const opacity = disabled ? 0.5 : 1;

  return (
    <Svg
      width={sizeToHeight[size]}
      height={sizeToHeight[size]}
      stroke={svgStroke}
      strokeWidth={1}
      style={style}
    >
      <Defs>
        <Pattern id="image-pattern" x="0" y="0" width="1" height="1">
          <Image
            height={sizeToHeight[size]}
            width={sizeToHeight[size]}
            x="0"
            y="0"
            opacity={opacity}
            href={{ uri: imageSrc, headers: imageHeaders }}
          />
        </Pattern>
      </Defs>
      <Path
        d={sizeToPath[size]}
        opacity={opacity}
        fill={imageSrc ? 'url(#image-pattern)' : Theme['gray-glass-005']}
      />
    </Svg>
  );
}
