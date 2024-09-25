import { BlockchainApiController } from '../controllers/BlockchainApiController';
import { OptionsController } from '../controllers/OptionsController';
import { NetworkController } from '../controllers/NetworkController';

export const SwapApiUtil = {
  async fetchGasPrice() {
    const projectId = OptionsController.state.projectId;
    const caipNetwork = NetworkController.state.caipNetwork;

    if (!caipNetwork) {
      return null;
    }

    return await BlockchainApiController.fetchGasPrice({
      projectId,
      chainId: caipNetwork.id
    });
  }
};
