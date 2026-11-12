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

fix(core): avoid blocking the JS thread on iOS when checking installed wallets at startup. The check now uses the native `isAppInstalled` from `@walletconnect/react-native-compat` (available on iOS since 2.10.5), which resolves a boolean instead of rejecting for schemes missing from `LSApplicationQueriesSchemes`, falls back to `Linking.canOpenURL` when it is not available, skips `excludeWalletIds`, and runs the checks in batches.
