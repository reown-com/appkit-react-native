import { fireEvent, render, act } from '@testing-library/react-native';
import { LogController, RouterController, WcController } from '@reown/appkit-core-react-native';
import { ConnectingWeb } from '../../partials/w3m-connecting-web';

jest.mock('valtio', () => ({
  ...jest.requireActual('valtio'),
  useSnapshot: jest.fn((state: Record<string, unknown>) => state)
}));

jest.mock(
  '@reown/appkit-ui-react-native',
  () => {
    const { TouchableOpacity, Text } = require('react-native');
    const Passthrough = ({ children }: any) => children ?? null;

    return {
      Button: ({ children, onPress }: any) => (
        <TouchableOpacity onPress={onPress}>
          <Text>{children}</Text>
        </TouchableOpacity>
      ),
      FlexView: Passthrough,
      LoadingThumbnail: Passthrough,
      WalletImage: () => null,
      Link: () => null,
      IconBox: () => null,
      Spacing: new Proxy({}, { get: () => 0 })
    };
  },
  { virtual: true }
);

jest.mock('../../partials/w3m-connecting-body', () => ({
  ConnectingBody: () => null,
  getMessage: () => ({ title: '' })
}));

describe('ConnectingWeb', () => {
  beforeEach(() => {
    WcController.resetState();
    RouterController.state.data = {
      wallet: { id: 'web-wallet', name: 'Web Wallet', webapp_link: 'https://wallet.example' } as any
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('leaves logging a failed connection to ConnectingView', async () => {
    const sendError = jest.spyOn(LogController, 'sendError').mockImplementation(() => {});
    const failedAttempt = Promise.reject(new Error('relay error'));
    failedAttempt.catch(() => {});
    WcController.setWcPromise(failedAttempt);
    WcController.setWcUri('wc:topic@2?relay-protocol=irn&symKey=key');

    const view = render(<ConnectingWeb onCopyUri={() => {}} />);

    await act(async () => {
      fireEvent.press(view.getByText('Open'));
    });

    expect(sendError).not.toHaveBeenCalled();
  });
});
