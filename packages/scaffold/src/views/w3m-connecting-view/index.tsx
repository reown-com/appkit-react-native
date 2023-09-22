import { useSnapshot } from 'valtio';
import { RouterController } from '@web3modal/core-react-native';

import { ConnectingQrCode } from '../../partials/w3m-connecting-qrcode';
import { ConnectingMobile } from '../../partials/w3m-connecting-mobile';

export function ConnectingView() {
  const { data } = useSnapshot(RouterController.state);

  if (!data?.wallet) return <ConnectingQrCode />;

  return <ConnectingMobile />;
}
