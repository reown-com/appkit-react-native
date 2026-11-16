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

fix(wagmi): reset the wagmi connector when the session ends

The wagmi adapter kept its wagmi connector after the wallet ended the session, or after
the session was disconnected from another namespace (e.g. Solana). On the next connection
it skipped the wagmi setup, so wagmi stayed disconnected and `switchNetwork` went to the
old connector. The adapter now drops the connector, and its wagmi connection, whenever
the session ends, removes it from the wagmi config instead of adding a new one on every
connection, and handles a failed wagmi connect instead of leaving an unhandled rejection.
