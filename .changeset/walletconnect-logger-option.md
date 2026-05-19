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

feat: add `logger` option to `createAppKit` for controlling `@walletconnect/universal-provider` log output. Accepts a log level (`'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'`). When omitted, WalletConnect's default logging is preserved.
