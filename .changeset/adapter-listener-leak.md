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

fix(common): stop adapter provider listeners from piling up on reconnect

`BlockchainAdapter` subscribed to the provider with `this.handler.bind(this)` and
tried to unsubscribe with a second `.bind(this)`, which creates a different
function, so `provider.off` never removed anything. Because the WalletConnect
provider is reused for the life of the app, every connect added another set of
`chainChanged` / `accountsChanged` / `disconnect` listeners, and a single wallet
event was handled once per past connection. The adapter now keeps stable handler
references, drops its previous subscription before subscribing again, and removes
its listeners on disconnect and in `removeConnector()`.
