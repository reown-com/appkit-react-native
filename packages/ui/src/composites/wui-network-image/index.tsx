import { Path, Svg, Image, Defs, Pattern } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';
import { PathLg, PathNormal } from './styles';

export interface NetworkImageProps {
  imageSrc?: string;
  imageHeaders?: Record<string, string>;
  selected?: boolean;
  size?: Exclude<SizeType, 'sm' | 'xs' | 'xxs'>;
  disabled?: boolean;
}

export function NetworkImage({
  imageSrc,
  imageHeaders,
  disabled,
  selected,
  size = 'md'
}: NetworkImageProps) {
  const Theme = useTheme();
  const isLg = size === 'lg';
  const svgWidth = isLg ? 96 : 56;
  const svgHeight = isLg ? 96 : 56;
  const svgStroke = selected ? Theme['accent-100'] : Theme['gray-glass-010'];
  const opacity = disabled ? 0.5 : 1;

  return (
    <Svg width={svgWidth} height={svgHeight} stroke={svgStroke} strokeWidth={1}>
      <Defs>
        <Pattern id="image-pattern" x="0" y="0" width="1" height="1">
          <Image
            height={svgHeight}
            width={svgWidth}
            x="0"
            y="0"
            opacity={opacity}
            href={{ uri: imageSrc, headers: imageHeaders }}
          />
        </Pattern>
      </Defs>
      <Path
        d={`${isLg ? PathLg : PathNormal}`}
        opacity={opacity}
        fill={imageSrc ? 'url(#image-pattern)' : Theme['gray-glass-005']}
      />
    </Svg>
  );
}
