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

fix(core): keep the modal closed when it is closed while opening

`ModalController.open` waits for the initial data prefetch before showing the modal.
If `close()` ran during that wait, the modal still opened once the prefetch finished.
An `open()` call now does nothing if `close()` or another `open()` ran while it waited.
