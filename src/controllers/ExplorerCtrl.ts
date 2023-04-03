import { proxy } from 'valtio/vanilla';
import type { ExplorerCtrlState } from '../types/controllerTypes';
import { ExplorerUtil } from '../utils/ExplorerUtil';
import { ConfigCtrl } from './ConfigCtrl';

// -- initial state ------------------------------------------------ //
const state = proxy<ExplorerCtrlState>({
  wallets: { listings: [], total: 0, page: 1 },
});

// -- helpers ------------------------------------------------------ //
function getProjectId() {
  const { projectId } = ConfigCtrl.state;
  if (!projectId) {
    throw new Error('projectId is required to work with explorer api');
  }

  return projectId;
}

// -- controller --------------------------------------------------- //
export const ExplorerCtrl = {
  state,

  async getAllWallets() {
    const { listings, total } = await ExplorerUtil.fetchWallets(getProjectId());
    state.wallets = { listings: Object.values(listings), page: 1, total };
  },

  getImageUrl(imageId: string) {
    return ExplorerUtil.formatImageUrl(getProjectId(), imageId);
  },
};
