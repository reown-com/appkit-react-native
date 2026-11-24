// Guards the public API: removing or renaming an export fails this test.
// If the change is intended, update the snapshot with `jest -u` and call it out in the changeset.
describe('public exports', () => {
  it('should keep the same export names', () => {
    expect(Object.keys(require('../index')).sort()).toMatchInlineSnapshot(`
[
  "ApiController",
  "ApiUtil",
  "AssetController",
  "AssetUtil",
  "BlockchainApiController",
  "ConnectionsController",
  "ConstantsUtil",
  "CoreHelperUtil",
  "EnsController",
  "EventUtil",
  "EventsController",
  "LogController",
  "LogUtils",
  "ModalController",
  "OnRampController",
  "OptionsController",
  "PublicStateController",
  "ReownAuthentication",
  "ReownAuthenticationMessenger",
  "RouterController",
  "SendController",
  "SnackController",
  "StorageUtil",
  "SwapController",
  "ThemeController",
  "TransactionsController",
  "WalletUtil",
  "WcController",
]
`);
  });
});
