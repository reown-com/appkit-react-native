---
'@reown/appkit-react-native': patch
'@reown/appkit-common-react-native': patch
'@reown/appkit-bitcoin-react-native': patch
'@reown/appkit-coinbase-react-native': patch
'@reown/appkit-core-react-native': patch
'@reown/appkit-ethers-react-native': patch
'@reown/appkit-solana-react-native': patch
'@reown/appkit-ui-react-native': patch
'@reown/appkit-wagmi-react-native': patch
---

fix: resolve high-severity security vulnerabilities in transitive dependencies

Patched 9 vulnerable packages via resolutions/overrides:
- h3 1.15.5 (Request Smuggling)
- tar 7.5.6 (Race Condition, Arbitrary File Overwrite)
- node-forge 1.3.2 (ASN.1 vulnerabilities)
- qs 6.14.1 (arrayLimit DoS)
- undici 6.23.0 (Decompression DoS)
- preact 10.28.2 (VNode Injection)
- js-yaml 4.1.1 (Prototype Pollution)
- valibot 1.2.0 (CVE-2025-66020 EMOJI_REGEX ReDoS)
- hono 4.11.4 (JWT Algorithm Confusion)
