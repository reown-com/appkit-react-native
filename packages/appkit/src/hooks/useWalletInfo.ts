import { useSnapshot } from 'valtio';
import { ConnectionsController, OptionsController } from '@reown/appkit-core-react-native';

export function useWalletInfo() {
  const { projectId } = useSnapshot(OptionsController.state);
  const { walletInfo } = useSnapshot(ConnectionsController.state);

  if (!projectId) {
    throw new Error('Please call "createAppKit" before using "useWalletInfo" hook');
  }

  return { walletInfo };
}
