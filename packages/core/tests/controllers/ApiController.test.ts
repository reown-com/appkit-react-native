import { ApiController } from '../../index.js';

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      page: 1,
      count: 0,
      recommended: [],
      wallets: [],
      search: [],
      sdkVersion: 'react-native-undefined'
    });
  });
});
