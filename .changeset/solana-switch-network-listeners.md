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

fix(solana): keep wallet events working after switching network with Phantom or Solflare

Switching network disconnects and reconnects the wallet. The disconnect destroyed the
provider's listeners, so after a network switch the app no longer reacted to the
wallet's events (account changes, disconnects) and missed the switch's own
`chainChanged` event. The switch now ends the wallet session without removing them.
