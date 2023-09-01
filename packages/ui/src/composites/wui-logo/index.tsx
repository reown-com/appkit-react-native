import type { SvgProps } from 'react-native-svg';
import { Icon } from '../../components/wui-icon';

import type { LogoType } from '../../utils/TypesUtil';

export interface LogoProps {
  logo: LogoType;
  disabled?: boolean;
  style?: SvgProps['style'];
}

export function Logo({ logo, style }: LogoProps) {
  return <Icon width={40} height={40} name={logo} style={style} />;
}
