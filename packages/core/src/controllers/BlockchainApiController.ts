import { FetchUtil } from '../utils/FetchUtil';
import type {
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse
} from '../utils/TypeUtils';
import { OptionsController } from './OptionsController';

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://rpc.walletconnect.com' });

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  fetchIdentity({ caipChainId, address }: BlockchainApiIdentityRequest) {
    return api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        chainId: caipChainId,
        projectId: OptionsController.state.projectId
      }
    });
  }
};
