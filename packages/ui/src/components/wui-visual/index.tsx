import type { SvgProps } from 'react-native-svg';

import BrowserSvg from '../../assets/visual/Browser';
import DaoSvg from '../../assets/visual/Dao';
import DefiSvg from '../../assets/visual/Defi';
import DefiAltSvg from '../../assets/visual/DefiAlt';
import EthSvg from '../../assets/visual/Eth';
import LayersSvg from '../../assets/visual/Layers';
import LockSvg from '../../assets/visual/Lock';
import LoginSvg from '../../assets/visual/Login';
import NetworkSvg from '../../assets/visual/Network';
import NftSvg from '../../assets/visual/Nft';
import NounSvg from '../../assets/visual/Noun';
import ProfileSvg from '../../assets/visual/Profile';
import SystemSvg from '../../assets/visual/System';
import type { VisualType } from '../../utils/TypesUtil';

const svgOptions: Record<VisualType, (props: SvgProps) => JSX.Element> = {
  browser: BrowserSvg,
  dao: DaoSvg,
  defi: DefiSvg,
  defiAlt: DefiAltSvg,
  eth: EthSvg,
  layers: LayersSvg,
  lock: LockSvg,
  login: LoginSvg,
  network: NetworkSvg,
  nft: NftSvg,
  noun: NounSvg,
  profile: ProfileSvg,
  system: SystemSvg
};

export interface VisualProps {
  name: VisualType;
  style?: SvgProps['style'];
}

export function Visual({ name, style }: VisualProps) {
  const Component = svgOptions[name];

  return <Component width={60} height={60} style={style} />;
}
