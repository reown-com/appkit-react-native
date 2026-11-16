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

fix(solana): settle Phantom and Solflare deep link requests

- A request replaced by a newer one is now rejected instead of never settling.
- A request is rejected when the app is back in the foreground for 30 seconds without a wallet redirect.
  The time spent in the wallet doesn't count.
- Deep links that aren't the wallet's answer to the pending request are ignored, instead of failing the request.
- `disconnect` always clears the local session (awaited), also when the wallet doesn't answer.
- Restoring a stored session that is invalid clears it locally, without opening the wallet on startup.
- Calling `init` again destroys the previous provider, so it doesn't keep handling deep links.
