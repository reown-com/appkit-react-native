import { OptionsController, SnackController } from '../../index';

// Setup
OptionsController.state.debug = true;

// eslint-disable-next-line no-console
console.error = jest.fn();

// -- Tests --------------------------------------------------------------------
describe('SnackController', () => {
  beforeEach(() => {
    // Use Jest's timer mocking
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers and clear any remaining timeouts
    jest.useRealTimers();
    SnackController.hide();
  });

  it('should have valid default state', () => {
    expect(SnackController.state).toEqual({
      message: '',
      variant: 'success',
      open: false,
      long: false
    });
  });

  it('should update state correctly on showSuccess()', () => {
    SnackController.showSuccess('Success Msg');
    expect(SnackController.state).toEqual({
      message: 'Success Msg',
      variant: 'success',
      open: true,
      long: false
    });
  });

  it('should update state correctly on hide()', () => {
    SnackController.hide();
    expect(SnackController.state).toEqual({
      ...SnackController.state,
      open: false,
      long: false
    });
  });

  it('should update state correctly on showError()', () => {
    SnackController.showError('Error Msg');
    expect(SnackController.state).toEqual({
      message: 'Error Msg',
      variant: 'error',
      open: true,
      long: false
    });
  });

  it('should update state correctly on showInternalError()', () => {
    SnackController.showInternalError({ shortMessage: 'Error Msg', longMessage: 'Error Msg' });
    expect(SnackController.state).toEqual({
      message: 'Error Msg',
      variant: 'error',
      open: true,
      long: true
    });
  });

  it('should auto-hide after timeout', () => {
    SnackController.showSuccess('Test Message');
    expect(SnackController.state.open).toBe(true);

    // Fast-forward time to trigger auto-hide
    jest.advanceTimersByTime(2200);
    expect(SnackController.state.open).toBe(false);
  });

  it('should auto-hide after longer timeout for long messages', () => {
    SnackController.showSuccess('Test Message', true);
    expect(SnackController.state.open).toBe(true);

    // Fast-forward time to trigger auto-hide
    jest.advanceTimersByTime(15000);
    expect(SnackController.state.open).toBe(false);
  });

  it('should clear previous timeout when showing new snack', () => {
    SnackController.showSuccess('First Msg');
    SnackController.showError('Second Msg');

    // Only the second message should auto-hide
    jest.advanceTimersByTime(2200);
    expect(SnackController.state.open).toBe(false);
    expect(SnackController.state.message).toBe('Second Msg');
  });
});
