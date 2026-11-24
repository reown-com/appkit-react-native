// Guards the public API: removing or renaming an export fails this test.
// If the change is intended, update the snapshot with `jest -u` and call it out in the changeset.
describe('public exports', () => {
  it('should keep the same export names', () => {
    expect(Object.keys(require('../index')).sort()).toMatchInlineSnapshot(`
[
  "BitcoinBaseAdapter",
  "BlockchainAdapter",
  "BlockchainOnRampError",
  "ConstantsUtil",
  "ContractUtil",
  "DateUtil",
  "EVMAdapter",
  "ErrorUtil",
  "NamesUtil",
  "NetworkUtil",
  "NumberUtil",
  "OnRampErrorType",
  "PresetsUtil",
  "SIWXVerifier",
  "SafeStorageKeys",
  "SolanaBaseAdapter",
  "StringUtil",
  "WalletConnector",
  "bitcoin",
  "bitcoinTestnet",
  "erc20ABI",
  "solana",
  "solanaDevnet",
  "solanaTestnet",
]
`);
  });
});
