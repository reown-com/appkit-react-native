import { BlockchainApiController } from '../../index';

const MOCK_IDENTITY = {
  name: 'test',
  avatar: 'https://example.com'
};

// Mock FetchUtil using jest
jest.mock('../../utils/FetchUtil', () => ({
  FetchUtil: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(MOCK_IDENTITY)
  }))
}));

// Mock ConnectionsController
jest.mock('../../controllers/ConnectionsController', () => ({
  ConnectionsController: {
    state: {
      activeCaipNetworkId: 'eip155:1'
    }
  }
}));

// Mock isNetworkSupported using jest
jest.spyOn(BlockchainApiController, 'isNetworkSupported').mockResolvedValue(true);

// @ts-ignore
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    headers: {
      get: () => 'application/json'
    },
    json: () => Promise.resolve(MOCK_IDENTITY)
  })
);

// -- Tests --------------------------------------------------------------------
describe('BlockchainApiController', () => {
  // Reset the API state before each test
  beforeEach(() => {
    // Ensure API instance is properly mocked
    BlockchainApiController.state.api = {
      get: jest.fn().mockResolvedValue(MOCK_IDENTITY)
    } as any;
  });

  it('fetch identity of account', async () => {
    let identity = await BlockchainApiController.fetchIdentity({
      address: '0x00000'
    });
    expect(identity).toEqual(MOCK_IDENTITY);
  });
});
