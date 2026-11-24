// Guards the public API: removing or renaming an export fails this test.
// If the change is intended, update the snapshot with `jest -u` and call it out in the changeset.
// wagmi only ships ESM; @wagmi/core provides the same connector helpers the package imports
jest.mock('wagmi', () => jest.requireActual('@wagmi/core'));

describe('public exports', () => {
  it('should keep the same export names', () => {
    expect(Object.keys(require('../index')).sort()).toMatchInlineSnapshot(`
[
  "WagmiAdapter",
  "formatNetwork",
  "formatNetworks",
]
`);
  });
});
