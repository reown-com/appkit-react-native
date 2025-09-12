import type { WcWallet } from '@reown/appkit-common-react-native';
import { ApiController } from '../controllers/ApiController';
import { OptionsController } from '../controllers/OptionsController';

export const WalletUtil = {
  getWallet: (walletId: string): WcWallet | undefined => {
    const { wallets, recommended, featured, installed } = ApiController.state;
    const customWallets = OptionsController.state.customWallets ?? [];
    const allWallets = [...wallets, ...recommended, ...featured, ...installed, ...customWallets];
    const wallet = allWallets.find(w => w.id === walletId);

    return wallet;
  }
};
