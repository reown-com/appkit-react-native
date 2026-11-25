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

fix: open the modal right away instead of waiting for the wallet prefetch

`ModalController.open` waited up to 3 seconds for the initial data prefetch before
showing the modal, with no feedback, and a `close()` during that wait was ignored.
The modal now opens immediately and the connect view shows loading placeholders
until the wallets arrive. The "All wallets" count is hidden until it is known.
