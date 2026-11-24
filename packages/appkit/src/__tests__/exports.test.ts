// Guards the public API: removing or renaming an export fails this test.
// If the change is intended, update the snapshot with `jest -u` and call it out in the changeset.

// Side-effect polyfills only, and shipped as ESM
jest.mock('@walletconnect/react-native-compat', () => ({}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 })
}));

describe('public exports', () => {
  it('should keep the same export names', () => {
    expect(Object.keys(require('../index')).sort()).toMatchInlineSnapshot(`
[
  "AccountButton",
  "AppKit",
  "AppKitButton",
  "AppKitProvider",
  "ConnectButton",
  "NetworkButton",
  "ReownAuthentication",
  "bitcoin",
  "bitcoinTestnet",
  "createAppKit",
  "solana",
  "solanaDevnet",
  "solanaTestnet",
  "useAccount",
  "useAppKit",
  "useAppKitEventSubscription",
  "useAppKitEvents",
  "useAppKitLogs",
  "useAppKitState",
  "useAppKitTheme",
  "useProvider",
  "useWalletInfo",
]
`);
  });
});
