import { ConnectionController } from '../../index';

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
describe('ConnectionController', () => {
  it('should have valid default state', () => {
    expect(ConnectionController.state).toEqual({
      wcError: false
    });
  });

  it('should update state correctly on disconnect()', async () => {
    await ConnectionController.disconnect();
    expect(ConnectionController.state.wcUri).toEqual(undefined);
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
    expect(ConnectionController.state.wcPromise).toEqual(undefined);
  });

  it('should update state correctly on resetWcConnection()', () => {
    ConnectionController.resetWcConnection();
    expect(ConnectionController.state.wcUri).toEqual(undefined);
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined);
    expect(ConnectionController.state.wcPromise).toEqual(undefined);
  });
});
