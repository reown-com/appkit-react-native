import { proxy } from 'valtio';

import { CoreHelperUtil } from '../utils/CoreHelperUtil';
import { FetchUtil } from '../utils/FetchUtil';
import type {
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse
} from '../utils/TypeUtil';
import { OptionsController } from './OptionsController';

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl();

// -- Types --------------------------------------------- //
export interface BlockchainApiControllerState {
  clientId: string | null;
  api: FetchUtil;
}

// -- State --------------------------------------------- //
const state = proxy<BlockchainApiControllerState>({
  clientId: null,
  api: new FetchUtil({ baseUrl })
});

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  state,

  fetchIdentity({ address }: BlockchainApiIdentityRequest) {
    return state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        projectId: OptionsController.state.projectId
      }
    });
  },

  setClientId(clientId: string | null) {
    state.clientId = clientId;
    state.api = new FetchUtil({ baseUrl, clientId });
  }
};
