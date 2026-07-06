---
'@reown/appkit-core-react-native': patch
---

fix(core): load wallet & network images on React Native

`FetchUtil.fetchImage` built its data URL with `response.blob()` + `FileReader`,
but on React Native `fetch(...).blob()` throws "Creating blobs from 'ArrayBuffer'
and 'ArrayBufferView' are not supported" for binary responses — so wallet and
network images silently failed to load (placeholders only). Read the bytes via
`response.arrayBuffer()` and base64-encode them into the data URL instead, using
a dependency-free encoder (RN guarantees neither `Buffer` nor `btoa`).
