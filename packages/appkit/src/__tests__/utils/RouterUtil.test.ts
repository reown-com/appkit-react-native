import { RouterUtil } from '../../utils/RouterUtil';

const mockRouterState: { view: string; history: string[] } = {
  view: 'Connect',
  history: ['Connect']
};

// The import above is hoisted, so read the state lazily
jest.mock('@reown/appkit-core-react-native', () => ({
  RouterController: {
    get state() {
      return mockRouterState;
    }
  }
}));

describe('RouterUtil.isUnsupportedChainView', () => {
  it('is true on the unsupported network view', () => {
    mockRouterState.view = 'UnsupportedChain';
    mockRouterState.history = ['Account', 'UnsupportedChain'];

    expect(RouterUtil.isUnsupportedChainView()).toBe(true);
  });

  it('is true when switching network from the unsupported network view', () => {
    mockRouterState.view = 'SwitchNetwork';
    mockRouterState.history = ['UnsupportedChain', 'SwitchNetwork'];

    expect(RouterUtil.isUnsupportedChainView()).toBe(true);
  });

  it('is false when switching network from another view', () => {
    mockRouterState.view = 'SwitchNetwork';
    mockRouterState.history = ['Networks', 'SwitchNetwork'];

    expect(RouterUtil.isUnsupportedChainView()).toBe(false);
  });

  it('is false on other views', () => {
    mockRouterState.view = 'Account';
    mockRouterState.history = ['Account'];

    expect(RouterUtil.isUnsupportedChainView()).toBe(false);
  });
});
