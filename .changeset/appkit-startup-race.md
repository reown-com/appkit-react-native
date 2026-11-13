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

fix: make connecting during AppKit startup reliable. `connect()` now waits for the initial setup and the WalletConnect connector initialization instead of failing with "Provider not initialized", a failed initialization is retried on the next connect instead of breaking connections until the app restarts, the AppKit buttons no longer stay loading when initialization fails, and stored sessions are restored after the SIWX and default network options are set. Also stops leaking a `display_uri` listener on every failed connection attempt, avoids a duplicate connection attempt on each QR refresh, and shows an error in the social login view when the connection can't start.
