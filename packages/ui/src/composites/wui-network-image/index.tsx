import { Path, Svg, Image, Defs, Pattern } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { SizeType } from '../../utils/TypesUtil';
import { Icon } from '../../components/wui-icon';
import { FlexView } from '../../layout/wui-flex';
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

  return (
    <Svg
      width={sizeToHeight[size]}
      height={sizeToHeight[size]}
      stroke={borderColor ?? svgStroke}
      strokeWidth={borderWidth}
      style={style}
    >
      <Defs>
        <Pattern id="image-pattern">
          {imageSrc ? (
            <Image
              height={sizeToHeight[size]}
              width={sizeToHeight[size]}
              opacity={opacity}
              href={{ uri: imageSrc, headers: imageHeaders }}
            />
          ) : (
            <FlexView
              alignItems="center"
              justifyContent="center"
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: sizeToHeight[size],
                width: sizeToHeight[size],
                backgroundColor: 'transparent'
              }}
            >
              <Icon name="networkPlaceholder" size={size} color="fg-200" />
            </FlexView>
          )}
        </Pattern>
      </Defs>
      {!imageSrc && <Path d={sizeToPath[size]} opacity={opacity} fill={Theme['gray-glass-005']} />}
      <Path d={sizeToPath[size]} opacity={opacity} fill="url(#image-pattern)" />
    </Svg>
  );
}
