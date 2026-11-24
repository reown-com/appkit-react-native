---
'@reown/appkit-react-native': patch
'@reown/appkit-bitcoin-react-native': patch
'@reown/appkit-coinbase-react-native': patch
'@reown/appkit-common-react-native': patch
'@reown/appkit-core-react-native': patch
'@reown/appkit-ethers-react-native': patch
'@reown/appkit-solana-react-native': patch
'@reown/appkit-ui-react-native': patch
'@reown/appkit-wagmi-react-native': patch
---

fix(core): keep stored connections consistent and match accounts to the exact network

- Saving and removing connected connectors at the same time no longer drops one of the
  changes, so every connection is restored on the next app start.
- Stored connectors, recent wallets and the active namespace with an unexpected value
  are ignored instead of blocking later writes.
- A failed write when adding a recent wallet is logged instead of becoming an unhandled
  promise rejection.
- Accounts are matched to the exact network: `eip155:1` no longer picks accounts or smart
  accounts from `eip155:137` or `eip155:10`, and networks the wallet isn't connected to
  are no longer listed as available.
- `ConnectionsController.state.isConnected` is true only when the active namespace has a
  connection, so it matches `activeAddress` and `connection`.
- `ConnectionsController.fetchBalance` returns without fetching when there is no active
  connection or address instead of rejecting.
