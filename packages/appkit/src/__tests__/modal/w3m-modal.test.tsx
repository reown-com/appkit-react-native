import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';

const mockClose = jest.fn();
const mockPrefetch = jest.fn().mockResolvedValue(undefined);
const mockSendEvent = jest.fn();

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
      Modal: ({ children, testID }: any) => <MockView testID={testID}>{children}</MockView>,
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
      state: {
        open: true
      }
    },
    OptionsController: {
      state: {
        projectId: 'project-id'
      }
    },
    RouterController: {
      state: {
        history: ['Connect']
      },
      goBack: jest.fn()
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
  });

  it('renders the modal without a wrapper', () => {
    const { getByTestId, queryByTestId } = render(<AppKit />);

    expect(getByTestId('w3m-modal')).toBeTruthy();
    expect(queryByTestId('modal-wrapper')).toBeNull();
  });

  it('wraps the modal when modalWrapper is provided', () => {
    function ModalWrapper({ children }: { children: React.ReactNode }) {
      return <View testID="modal-wrapper">{children}</View>;
    }

    const { getByTestId } = render(<AppKit modalWrapper={ModalWrapper} />);

    expect(getByTestId('modal-wrapper')).toBeTruthy();
    expect(getByTestId('w3m-modal')).toBeTruthy();
  });
});
