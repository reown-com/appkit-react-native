import { ApiController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('ApiController', () => {
  it('should have valid default state', () => {
    expect(ApiController.state).toEqual({
      page: 1,
      count: 0,
      recommended: [],
      featured: [],
      installed: [],
      wallets: [],
      search: []
    });
  });
});
