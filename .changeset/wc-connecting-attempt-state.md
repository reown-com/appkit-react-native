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

fix: the WalletConnect connecting view no longer starts a second connection while one is still waiting for its pairing URI, and ignores failures from attempts that a newer one replaced. Only a rejection from the wallet reads as "Connection declined"; other failures show "Connection error". The connection error is also cleared when the WalletConnect state is reset.
