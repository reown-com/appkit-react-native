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

fix(core): call event subscribers once per event

`EventsController.sendEvent` wrote `timestamp` and `data` separately, and subscribers
run on every write, so the `useAppKitEvents` callback ran twice per event and first saw
the previous event. `useAppKitEventSubscription` could also run twice when the same
event was sent twice in a row. Wallet impressions queued with `trackWalletImpression`
also triggered `useAppKitEvents`. Subscribers are now called once per sent event,
with the new data and timestamp.
