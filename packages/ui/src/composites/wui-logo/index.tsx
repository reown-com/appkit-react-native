import type { SvgProps } from 'react-native-svg';
import { Icon } from '../../components/wui-icon';

import type { LogoType } from '../../utils/TypesUtil';

export interface LogoProps {
  logo: LogoType;
  disabled?: boolean;
  height?: number;
  width?: number;
  style?: SvgProps['style'];
}

export function Logo({ width = 40, height = 40, logo, style }: LogoProps) {
  return <Icon width={width} height={height} name={logo} style={style} />;
}
