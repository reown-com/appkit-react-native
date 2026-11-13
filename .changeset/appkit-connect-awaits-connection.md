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

fix: `connect()` now resolves only after the connection is set up (adapters bound, connection stored, SIWX sessions checked), and rejects if it can't be set up, for example when no adapter matches the namespaces the wallet approved. On failure the wallet session is closed and the connector isn't saved, so it isn't restored on the next app start. Balance and identity are still fetched in the background, and their errors are logged instead of becoming unhandled rejections.
