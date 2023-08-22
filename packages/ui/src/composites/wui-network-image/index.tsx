import { Path, Svg, Image, Defs, Pattern } from 'react-native-svg';
import useTheme from '../../hooks/useTheme';
import { SizeType } from '../../utils/TypesUtil';
import { PathLg, PathNormal } from './styles';

export interface NetworkImageProps {
  imageSrc?: string;
  selected?: boolean;
  size?: Exclude<SizeType, 'sm' | 'xs' | 'xxs'>;
}

export function NetworkImage({ imageSrc, selected, size = 'md' }: NetworkImageProps) {
  const Theme = useTheme();
  const isLg = size === 'lg';
  const svgWidth = isLg ? 96 : 56;
  const svgHeight = isLg ? 96 : 56;
  const svgStroke = selected ? Theme['blue-100'] : Theme['overlay-010'];

  return (
    <Svg width={svgWidth} height={svgHeight} stroke={svgStroke} strokeWidth={1}>
      <Defs>
        <Pattern id="image-pattern" x="0" y="0" width="1" height="1">
          <Image height={svgHeight} width={svgWidth} x="0" y="0" href={imageSrc} />
        </Pattern>
      </Defs>
      <Path
        d={`${isLg ? PathLg : PathNormal}`}
        fill={imageSrc ? 'url(#image-pattern)' : Theme['overlay-005']}
      />
    </Svg>
  );
}
