import { BlockchainApiController } from '../../index';

const MOCK_IDENTITY = {
  name: 'test',
  avatar: 'https://example.com'
};

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
  it('fetch identity of account', async () => {
    let identity = await BlockchainApiController.fetchIdentity({
      caipChainId: 'eip155:1',
      address: '0x00000'
    });
    expect(identity).toEqual(MOCK_IDENTITY);
  });
});
