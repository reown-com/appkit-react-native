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

  it('should keep the error type only while there is an error', () => {
    WcController.setWcError(true, 'declined');
    expect(WcController.state.wcError).toBe(true);
    expect(WcController.state.wcErrorType).toBe('declined');

    WcController.setWcError(false);
    expect(WcController.state.wcError).toBe(false);
    expect(WcController.state.wcErrorType).toBeUndefined();
  });

  it('should default to a generic error type', () => {
    WcController.setWcError(true);
    expect(WcController.state.wcErrorType).toBe('default');
  });

  it('should clear the error on resetState()', () => {
    WcController.setWcError(true, 'declined');
    WcController.resetState();
    expect(WcController.state.wcError).toBe(false);
    expect(WcController.state.wcErrorType).toBeUndefined();
  });
});
