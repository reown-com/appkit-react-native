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

fix(wagmi): tell wagmi when the wallet switches to a chain outside the wagmi config

The wagmi `UniversalConnector` dropped `chainChanged` events for chains that were not
in the wagmi config. wagmi kept the previous chain while the WalletConnect provider
already used the new one, so requests such as `signTypedData` went out with the wrong
`chainId`, and AppKit never showed the `UnsupportedChain` view. The connector now
forwards every EVM chain change to wagmi, like wagmi's own `walletConnect` connector:
`useAccount()` returns `chain: undefined` with the new `chainId`, and AppKit asks the
user to switch to a supported network. Non-EVM chain references from the shared
provider (Solana, Bitcoin) are still ignored.
