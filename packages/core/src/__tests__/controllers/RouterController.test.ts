import { RouterController } from '../../index';

// -- Tests --------------------------------------------------------------------
describe('RouterController', () => {
  it('should have valid default state', () => {
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect'],
      navigationDirection: 'none'
    });
  });

  it('should update state correctly on push()', () => {
    RouterController.push('Account');
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account'],
      navigationDirection: 'forward'
    });
  });

  it('should not update state when push() is called with the same view', () => {
    RouterController.push('Account');
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account'],
      navigationDirection: 'forward'
    });
  });

  it('should update state correctly on goBack()', () => {
    RouterController.goBack();
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect'],
      navigationDirection: 'backward'
    });
  });

  it('should not update state when goBack() is called with only one view in history', () => {
    RouterController.goBack();
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect'],
      navigationDirection: 'backward'
    });
  });

  it('should update state correctly on reset()', () => {
    RouterController.reset('Account');
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Account'],
      navigationDirection: 'none'
    });
  });

  it('should update state correctly on replace()', () => {
    RouterController.push('Connect');
    RouterController.replace('Networks');
    expect(RouterController.state).toEqual({
      view: 'Networks',
      history: ['Account', 'Networks'],
      navigationDirection: 'none'
    });
  });

  it('should update state correctly on push() with data', () => {
    RouterController.push('ConnectingWalletConnect', {
      wallet: { id: 'test', name: 'TestWallet' }
    });
    expect(RouterController.state).toEqual({
      view: 'ConnectingWalletConnect',
      history: ['Account', 'Networks', 'ConnectingWalletConnect'],
      navigationDirection: 'forward',
      data: {
        wallet: { id: 'test', name: 'TestWallet' }
      }
    });
  });
});
