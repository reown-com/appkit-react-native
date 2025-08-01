import { ConstantsUtil, OptionsController } from '../../index';

const MOCK_WALLET_IDS = [
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
];

const MOCK_CLIPBOARD_CLIENT = {
  setString: (_value: string) => Promise.resolve(undefined)
};

// -- Tests --------------------------------------------------------------------
describe('OptionsController', () => {
  it('should have valid default state', () => {
    expect(OptionsController.state).toEqual({
      projectId: '',
      sdkType: 'appkit',
      sdkVersion: 'react-native-undefined-undefined',
      features: ConstantsUtil.DEFAULT_FEATURES,
      debug: false
    });
  });

  it('should update state correctly on setProjectId()', () => {
    OptionsController.setProjectId('123');
    expect(OptionsController.state.projectId).toEqual('123');
  });

  it('should update state correctly on setIncludeWalletIds()', () => {
    OptionsController.setIncludeWalletIds(MOCK_WALLET_IDS);
    expect(OptionsController.state.includeWalletIds).toEqual(MOCK_WALLET_IDS);
  });

  it('should update state correctly on setExcludeWalletIds()', () => {
    OptionsController.setExcludeWalletIds(MOCK_WALLET_IDS);
    expect(OptionsController.state.excludeWalletIds).toEqual(MOCK_WALLET_IDS);
  });

  it('should update state correctly on setFeaturedWalletIds()', () => {
    OptionsController.setFeaturedWalletIds(MOCK_WALLET_IDS);
    expect(OptionsController.state.featuredWalletIds).toEqual(MOCK_WALLET_IDS);
  });

  it('should detect that clipboard is not available', () => {
    expect(OptionsController.isClipboardAvailable()).toBeFalsy();
    expect(OptionsController.copyToClipboard('')).toBeUndefined();
  });

  it('should detect that clipboard is available', () => {
    OptionsController.setClipboardClient(MOCK_CLIPBOARD_CLIENT);
    expect(OptionsController.isClipboardAvailable()).toBeTruthy();
    expect(OptionsController.copyToClipboard('')).toBeUndefined();
  });

  it('should update state correctly on setSdkVersion()', () => {
    OptionsController.setSdkVersion('react-native-wagmi-1.0.0');
    expect(OptionsController.state.sdkVersion).toEqual('react-native-wagmi-1.0.0');
  });
});
