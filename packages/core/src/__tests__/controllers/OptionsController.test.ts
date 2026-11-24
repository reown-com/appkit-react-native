import { resetControllers } from '@shared-jest-setup';
import { OptionsController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  afterEach(() => {
    resetControllers();
  });

  it('should detect that clipboard is not available', () => {
    expect(OptionsController.isClipboardAvailable()).toBeFalsy();
    expect(OptionsController.copyToClipboard('')).toBeUndefined();
  });

  it('should copy through the clipboard client once one is set', () => {
    const setString = jest.fn().mockResolvedValue(undefined);
    OptionsController.setClipboardClient({ setString });

    expect(OptionsController.isClipboardAvailable()).toBeTruthy();
    OptionsController.copyToClipboard('0x123');
    expect(setString).toHaveBeenCalledWith('0x123');
  });
});
