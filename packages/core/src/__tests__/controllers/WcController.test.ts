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
  it('should clear the pairing on resetState()', () => {
    WcController.setWcUri('wc:test@2');
    WcController.setWcPromise(Promise.resolve() as any);
    WcController.resetState();
    expect(WcController.state.wcUri).toEqual(undefined);
    expect(WcController.state.wcPairingExpiry).toEqual(undefined);
    expect(WcController.state.wcPromise).toEqual(undefined);
  });

  it('should keep the error type only while there is an error', () => {
    WcController.setWcError(true);
    expect(WcController.state.wcErrorType).toBe('default');

    WcController.setWcError(true, 'declined');
    expect(WcController.state.wcError).toBe(true);
    expect(WcController.state.wcErrorType).toBe('declined');

    WcController.setWcError(false);
    expect(WcController.state.wcError).toBe(false);
    expect(WcController.state.wcErrorType).toBeUndefined();
  });

  it('should clear the error on resetState()', () => {
    WcController.setWcError(true, 'declined');
    WcController.resetState();
    expect(WcController.state.wcError).toBe(false);
    expect(WcController.state.wcErrorType).toBeUndefined();
  });
});
