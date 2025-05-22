import type { CaipNetwork, CaipNetworkId, NetworkControllerClient } from '../../index';
import { NetworkController } from '../../index';

// -- Setup --------------------------------------------------------------------
const caipNetwork = { id: 'eip155:1', name: 'Ethereum' } as const;
const requestedCaipNetworks = [
  { id: 'eip155:1', name: 'Ethereum' },
  { id: 'eip155:42161', name: 'Arbitrum One' },
  { id: 'eip155:43114', name: 'Avalanche C-Chain' }
] as CaipNetwork[];
const approvedCaipNetworkIds = ['eip155:1', 'eip155:42161'] as CaipNetworkId[];

const client: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve(),
  getApprovedCaipNetworksData: async () =>
    Promise.resolve({ approvedCaipNetworkIds, supportsAllNetworks: false })
};

const initialState = {
  _client: client,
  supportsAllNetworks: true,
  isDefaultCaipNetwork: false,
  smartAccountEnabledNetworks: []
};

// -- Tests --------------------------------------------------------------------
describe('NetworkController', () => {
  it('should throw if client not set', () => {
    expect(NetworkController._getClient).toThrow('NetworkController client not set');
  });

  it('should have valid default state', () => {
    NetworkController.setClient(client);

    expect(NetworkController.state).toEqual(initialState);
  });

  it('should update state correctly on setRequestedCaipNetworks()', () => {
    NetworkController.setRequestedCaipNetworks(requestedCaipNetworks);
    expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks);
  });

  it('should update state correctly on switchCaipNetwork()', async () => {
    await NetworkController.switchActiveNetwork(caipNetwork);
    expect(NetworkController.state.caipNetwork).toEqual(caipNetwork);
  });

  it('should update state correctly on setCaipNetwork()', () => {
    NetworkController.setCaipNetwork(caipNetwork);
    expect(NetworkController.state.caipNetwork).toEqual(caipNetwork);
  });

  it('should update state correctly on getApprovedCaipNetworkIds()', async () => {
    await NetworkController.getApprovedCaipNetworksData();
    expect(NetworkController.state.approvedCaipNetworkIds).toEqual(approvedCaipNetworkIds);
  });

  it('should reset state correctly on resetNetwork()', () => {
    NetworkController.resetNetwork();
    expect(NetworkController.state.caipNetwork).toEqual(undefined);
    expect(NetworkController.state.approvedCaipNetworkIds).toEqual(undefined);
    expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks);
  });

  it('should update state correctly on setDefaultCaipNetwork()', () => {
    NetworkController.setDefaultCaipNetwork(caipNetwork);
    expect(NetworkController.state.caipNetwork).toEqual(caipNetwork);
    expect(NetworkController.state.isDefaultCaipNetwork).toEqual(true);
  });

  it('should reset state correctly when default caip network is true', () => {
    NetworkController.resetNetwork();
    expect(NetworkController.state.caipNetwork).toEqual(caipNetwork);
    expect(NetworkController.state.approvedCaipNetworkIds).toEqual(undefined);
    expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks);
  });

  it('should validate if active network is in requested networks', () => {
    NetworkController.setRequestedCaipNetworks(requestedCaipNetworks);
    
    NetworkController.setCaipNetwork({ id: 'eip155:1', name: 'Ethereum' });
    expect(NetworkController.isActiveNetworkInRequestedNetworks()).toBe(true);
    
    NetworkController.setCaipNetwork({ id: 'eip155:99', name: 'Unknown Network' });
    expect(NetworkController.isActiveNetworkInRequestedNetworks()).toBe(false);
  });
});
