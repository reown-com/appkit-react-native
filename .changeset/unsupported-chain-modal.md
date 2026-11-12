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

fix(appkit): handle unsupported networks like AppKit web

When the wallet switches to a network the app doesn't support, AppKit now stores that
network as the active one, so the network button shows "Unknown Network" instead of the
previous network. Closing the `UnsupportedChain` view (close button, backdrop or Android
back) no longer disconnects the user: the modal shakes and stays open until the user
switches to a supported network or disconnects. The account button opens the
`UnsupportedChain` view while the active network is unsupported.

Note: `useAppKit().close()` also shakes instead of closing while the `UnsupportedChain`
view (or `SwitchNetwork` opened from it) is shown.
