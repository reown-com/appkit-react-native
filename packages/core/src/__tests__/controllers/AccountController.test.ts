import { AccountController } from '../../index';

// -- Setup --------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123';
const balance = '0.100';
const balanceSymbol = 'ETH';
const profileName = 'john.eth';
const profileImage = 'https://ipfs.com/0x123.png';

const initialState = {
  isConnected: false,
  tokenBalance: [],
  preferredAccountType: 'eoa',
  smartAccountDeployed: false
};

// -- Tests --------------------------------------------------------------------
describe('AccountController', () => {
  it('should have valid default state', () => {
    expect(AccountController.state).toEqual(initialState);
  });

  it('should update state correctly on setIsConnected()', () => {
    AccountController.setIsConnected(true);
    expect(AccountController.state.isConnected).toEqual(true);
  });

  it('should update state correctly on setCaipAddress()', () => {
    AccountController.setCaipAddress(caipAddress);
    expect(AccountController.state.caipAddress).toEqual(caipAddress);
    expect(AccountController.state.address).toEqual('0x123');
  });

  it('should update state correctly on setBalance()', () => {
    AccountController.setBalance(balance, balanceSymbol);
    expect(AccountController.state.balance).toEqual(balance);
    expect(AccountController.state.balanceSymbol).toEqual(balanceSymbol);
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
