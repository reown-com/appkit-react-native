import type { WcWallet } from '@reown/appkit-common-react-native';
import { act, render } from '@testing-library/react-native';
import { ApiController } from '@reown/appkit-core-react-native';
import { ListItemLoader } from '@reown/appkit-ui-react-native';
import { AllWalletList } from '../../views/w3m-connect-view/components/all-wallet-list';

const wallet = { id: 'wallet-1', name: 'Wallet One' } as WcWallet;

describe('AllWalletList', () => {
  beforeEach(() => {
    // The loaders run a looping shimmer animation
    jest.useFakeTimers();
    ApiController.state.prefetchLoading = false;
    ApiController.state.featured = [];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loaders while the prefetch runs, even before any wallet is known', () => {
    // The modal opens without waiting for the prefetch, so the first render can have no wallets
    ApiController.state.prefetchLoading = true;

    const view = render(<AllWalletList itemStyle={{}} onWalletPress={jest.fn()} />);

    expect(view.UNSAFE_getAllByType(ListItemLoader)).toHaveLength(2);
  });

  it('shows the wallets once the prefetch ends', async () => {
    ApiController.state.prefetchLoading = true;
    const view = render(<AllWalletList itemStyle={{}} onWalletPress={jest.fn()} />);

    await act(async () => {
      ApiController.state.featured = [wallet];
      ApiController.state.prefetchLoading = false;
    });

    expect(view.UNSAFE_queryAllByType(ListItemLoader)).toHaveLength(0);
    expect(view.getByText('Wallet One')).toBeTruthy();
  });
});
