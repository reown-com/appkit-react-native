import { OptionsController, SnackController } from '../../index';

// Setup
OptionsController.state.debug = true;

// eslint-disable-next-line no-console
console.error = jest.fn();

// -- Tests --------------------------------------------------------------------
describe('SnackController', () => {
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
      message: '',
      variant: 'success',
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
});
