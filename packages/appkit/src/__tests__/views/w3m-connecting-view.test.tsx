import { act, render } from '@testing-library/react-native';
import {
  ConstantsUtil,
  RouterController,
  SnackController,
  WcController
} from '@reown/appkit-core-react-native';
import { ConnectingView } from '../../views/w3m-connecting-view';

const mockConnect = jest.fn();

jest.mock('../../AppKitContext', () => ({
  useInternalAppKit: jest.fn(() => ({ connect: mockConnect }))
}));

jest.mock('../../partials/w3m-connecting-qrcode', () => ({ ConnectingQrCode: () => null }));
jest.mock('../../partials/w3m-connecting-mobile', () => ({ ConnectingMobile: () => null }));
jest.mock('../../partials/w3m-connecting-web', () => ({ ConnectingWeb: () => null }));
jest.mock('../../partials/w3m-connecting-header', () => ({ ConnectingHeader: () => null }));

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const flush = () => act(async () => {});

describe('ConnectingView', () => {
  let showError: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    mockConnect.mockReset();
    WcController.resetState();
    RouterController.state.data = undefined; // QR mode
    showError = jest.spyOn(SnackController, 'showError').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('does not start another connection while one is still waiting for its pairing URI', async () => {
    mockConnect.mockReturnValue(deferred().promise);

    const view = render(<ConnectingView />);
    await flush();
    expect(mockConnect).toHaveBeenCalledTimes(1);

    // The relay is slow: no URI yet after several pairing-expiry checks
    await act(async () => {
      jest.advanceTimersByTime(ConstantsUtil.TEN_SEC_MS * 3);
    });
    expect(mockConnect).toHaveBeenCalledTimes(1);

    view.unmount();
  });

  it('starts a new connection after the in-flight attempt failed', async () => {
    const first = deferred();
    mockConnect.mockReturnValueOnce(first.promise).mockReturnValue(deferred().promise);

    const view = render(<ConnectingView />);
    await flush();

    // Fails within a second, so there is no immediate retry and the interval has to pick it up
    await act(async () => {
      first.reject(new Error('relay error'));
    });
    expect(mockConnect).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(ConstantsUtil.TEN_SEC_MS);
    });
    expect(mockConnect).toHaveBeenCalledTimes(2);

    view.unmount();
  });

  it('ignores the failure of an attempt that a newer one replaced', async () => {
    const stale = deferred();
    const current = deferred();
    mockConnect.mockReturnValueOnce(stale.promise).mockReturnValue(current.promise);

    const view = render(<ConnectingView />);
    await flush();

    // The first pairing expired, so the interval replaced it with a new attempt
    WcController.setWcUri('wc:stale@2');
    WcController.state.wcPairingExpiry = Date.now();
    await act(async () => {
      jest.advanceTimersByTime(ConstantsUtil.TEN_SEC_MS);
    });
    expect(mockConnect).toHaveBeenCalledTimes(2);
    const currentPromise = WcController.state.wcPromise;

    await act(async () => {
      stale.reject(new Error('Proposal expired'));
    });

    expect(WcController.state.wcError).toBe(false);
    expect(WcController.state.wcPromise).toBe(currentPromise);
    expect(showError).not.toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalledTimes(2);

    view.unmount();
  });

  it('marks a user rejection as declined', async () => {
    const attempt = deferred();
    mockConnect.mockReturnValueOnce(attempt.promise).mockReturnValue(deferred().promise);

    const view = render(<ConnectingView />);
    await flush();

    await act(async () => {
      // How WalletConnect reports a rejected session proposal (getSdkError('USER_REJECTED'))
      attempt.reject({ code: 5000, message: 'User rejected.' });
    });

    expect(WcController.state.wcError).toBe(true);
    expect(WcController.state.wcErrorType).toBe('declined');

    view.unmount();
  });

  it('marks other failures as a generic error', async () => {
    const attempt = deferred();
    mockConnect.mockReturnValueOnce(attempt.promise).mockReturnValue(deferred().promise);

    const view = render(<ConnectingView />);
    await flush();

    await act(async () => {
      attempt.reject(new Error('Something broke'));
    });

    expect(WcController.state.wcError).toBe(true);
    expect(WcController.state.wcErrorType).toBe('default');

    view.unmount();
  });
});
