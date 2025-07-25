import { AccountController } from '../../index';

// -- Setup --------------------------------------------------------------------
const profileName = 'john.eth';
const profileImage = 'https://ipfs.com/0x123.png';

const initialState = {};

// -- Tests --------------------------------------------------------------------
describe('AccountController', () => {
  it('should have valid default state', () => {
    expect(AccountController.state).toEqual(initialState);
  });

  it('should update state correctly on setProfileName()', () => {
    AccountController.setProfileName(profileName);
    expect(AccountController.state.profileName).toEqual(profileName);
  });

  it('should update state correctly on setProfileImage()', () => {
    AccountController.setProfileImage(profileImage);
    expect(AccountController.state.profileImage).toEqual(profileImage);
  });

  it('should update state correctly on resetAccount()', () => {
    AccountController.resetAccount();
    expect(AccountController.state).toEqual(initialState);
  });
});
