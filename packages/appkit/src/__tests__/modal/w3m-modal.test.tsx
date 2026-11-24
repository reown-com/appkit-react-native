import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

const mockClose = jest.fn();
const mockPrefetch = jest.fn().mockResolvedValue(undefined);
const mockSendEvent = jest.fn();
const modalState = {
  open: true,
  shake: false
};
const mockRouterState: { view: string; history: string[] } = {
  view: 'Connect',
  history: ['Connect']
};
const mockGoBack = jest.fn();
let mockModalProps: any;

jest.mock('valtio', () => ({
  useSnapshot: jest.fn((state: Record<string, unknown>) => state)
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0 }))
}));

jest.mock('../../AppKitContext', () => ({
  useInternalAppKit: jest.fn(() => ({
    close: mockClose
  }))
}));

jest.mock('../../partials/w3m-header', () => ({
  Header: () => 'Header'
}));

jest.mock('../../partials/w3m-snackbar', () => ({
  Snackbar: () => 'Snackbar'
}));

jest.mock('../../modal/w3m-router', () => ({
  AppKitRouter: () => 'Router'
}));

jest.mock(
  '@reown/appkit-ui-react-native',
  () => {
    const { View: MockView } = require('react-native');

    return {
      Card: ({ children, ...props }: any) => (
        <MockView {...props} testID="mock-card">
          {children}
        </MockView>
      ),
      Modal: (props: any) => {
        const { children, testID, visible, contentWrapper: ContentWrapper } = props;
        mockModalProps = props;

        if (!visible) {
          return null;
        }

        const content = ContentWrapper ? <ContentWrapper>{children}</ContentWrapper> : children;

        return <MockView testID={testID}>{content}</MockView>;
      },
      ThemeProvider: ({ children }: any) => <>{children}</>
    };
  },
  { virtual: true }
);

jest.mock(
  '@reown/appkit-core-react-native',
  () => ({
    ApiController: {
      prefetch: mockPrefetch
    },
    EventsController: {
      sendEvent: mockSendEvent
    },
    ModalController: {
      state: modalState
    },
    OptionsController: {
      state: {
        projectId: 'project-id'
      }
    },
    RouterController: {
      state: mockRouterState,
      goBack: mockGoBack
    },
    ThemeController: {
      state: {
        themeMode: 'light',
        themeVariables: {}
      },
      setSystemThemeMode: jest.fn()
    }
  }),
  { virtual: true }
);

const { AppKit } = require('../../modal/w3m-modal');

describe('AppKit modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    modalState.open = true;
    mockRouterState.view = 'Connect';
    mockRouterState.history = ['Connect'];
  });

  it('passes the open state and the content wrapper to the modal', () => {
    function ModalContentWrapper({ children }: { children: React.ReactNode }) {
      return <View>{children}</View>;
    }
    modalState.open = false;

    render(<AppKit modalContentWrapper={ModalContentWrapper} />);

    expect(mockModalProps.visible).toBe(false);
    expect(mockModalProps.contentWrapper).toBe(ModalContentWrapper);
  });

  it('goes back on back press when there is history', () => {
    mockRouterState.view = 'Networks';
    mockRouterState.history = ['Account', 'Networks'];
    render(<AppKit />);

    mockModalProps.onRequestClose();

    expect(mockGoBack).toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('does not go back from the unsupported network view, it calls close instead', () => {
    mockRouterState.view = 'UnsupportedChain';
    mockRouterState.history = ['Account', 'UnsupportedChain'];
    render(<AppKit />);

    mockModalProps.onRequestClose();

    expect(mockGoBack).not.toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });
});
