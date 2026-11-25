import { resetControllers } from '@shared-jest-setup';
import { OptionsController, SnackController } from '../../index';

// eslint-disable-next-line no-console
console.error = jest.fn();

// -- Tests --------------------------------------------------------------------
describe('SnackController', () => {
  beforeEach(() => {
    // Use Jest's timer mocking
    jest.useFakeTimers();
    OptionsController.state.debug = true;
  });

  afterEach(() => {
    // Restore real timers and clear any remaining timeouts
    jest.useRealTimers();
    SnackController.hide();
    resetControllers();
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
    jest.advanceTimersByTime(2000);
    SnackController.showError('Second Msg');

    // The first snack's timer would have fired at 2200ms
    jest.advanceTimersByTime(300);
    expect(SnackController.state.open).toBe(true);
    expect(SnackController.state.message).toBe('Second Msg');

    jest.advanceTimersByTime(1900);
    expect(SnackController.state.open).toBe(false);
  });
});
