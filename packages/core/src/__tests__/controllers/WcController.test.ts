import { WcController } from '../../index';

// -- Setup --------------------------------------------------------------------

jest.mock('../../controllers/OptionsController', () => ({
  OptionsController: {
    state: {
      storage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      }
    },
    getStorage: () => ({
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    })
  }
}));

// -- Tests --------------------------------------------------------------------
describe('WcController', () => {
  it('should have valid default state', () => {
    expect(WcController.state).toEqual({
      wcError: false
    });
  });

  it('should update state correctly on resetState()', () => {
    WcController.resetState();
    expect(WcController.state.wcUri).toEqual(undefined);
    expect(WcController.state.wcPairingExpiry).toEqual(undefined);
    expect(WcController.state.wcPromise).toEqual(undefined);
  });
});
