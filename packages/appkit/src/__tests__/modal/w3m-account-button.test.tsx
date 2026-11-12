import { fireEvent, render } from '@testing-library/react-native';
import { AccountButton } from '../../modal/w3m-account-button';

const mockOpen = jest.fn();
const mockConnectionsState: {
  activeAddress?: string;
  activeNetwork?: { id: string };
  activeCaipNetworkId?: string;
} = {};

jest.mock('valtio', () => ({
  useSnapshot: jest.fn((state: Record<string, unknown>) => state)
}));

jest.mock(
  '@reown/appkit-ui-react-native',
  () => {
    const { Text: MockText } = require('react-native');

    return {
      AccountButton: ({ onPress, testID }: any) => <MockText onPress={onPress} testID={testID} />,
      ThemeProvider: ({ children }: any) => <>{children}</>
    };
  },
  { virtual: true }
);

jest.mock(
  '@reown/appkit-core-react-native',
  () => ({
    CoreHelperUtil: { formatBalance: jest.fn(() => '') },
    ModalController: { open: (...args: unknown[]) => mockOpen(...args) },
    ThemeController: { state: {} },
    ConnectionsController: {
      get state() {
        return mockConnectionsState;
      }
    },
    AssetController: { state: { networkImages: {} } },
    AssetUtil: { getNetworkImage: jest.fn() }
  }),
  { virtual: true }
);

describe('AccountButton', () => {
  beforeEach(() => {
    mockOpen.mockClear();
    mockConnectionsState.activeAddress = 'eip155:1:0x704457b418E9Fb723e1Bc0cB98106a6B8Cf87689';
  });

  it('opens the default view on a supported network', () => {
    mockConnectionsState.activeCaipNetworkId = 'eip155:1';
    mockConnectionsState.activeNetwork = { id: '1' };

    const { getByTestId } = render(<AccountButton testID="account-button" />);
    fireEvent.press(getByTestId('account-button'));

    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenCalledWith();
  });

  it('opens the UnsupportedChain view on an unsupported network', () => {
    mockConnectionsState.activeCaipNetworkId = 'eip155:137';
    mockConnectionsState.activeNetwork = undefined;

    const { getByTestId } = render(<AccountButton testID="account-button" />);
    fireEvent.press(getByTestId('account-button'));

    expect(mockOpen).toHaveBeenCalledWith({ view: 'UnsupportedChain' });
  });
});
