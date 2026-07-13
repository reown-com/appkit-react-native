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

fix(core): strip content-type parameters from fetchImage data URLs

`FetchUtil.fetchImage` embedded the raw `content-type` header in the data URL, so
a response like `image/svg+xml; charset=utf-8` produced a malformed
`data:image/svg+xml; charset=utf-8;base64,...` that strict parsers may reject.
Strip semicolon-delimited parameters before building the data URL, and add test
coverage for the base64 one-/two-byte padding branches.
