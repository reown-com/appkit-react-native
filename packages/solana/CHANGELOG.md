# @reown/appkit-solana-react-native

## 2.0.2

### Patch Changes

- [#501](https://github.com/reown-com/appkit-react-native/pull/501) [`5308d3c`](https://github.com/reown-com/appkit-react-native/commit/5308d3c0c02d7e516c3c689bd66308b6d6f6cf7d) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: renew uri after failure

- [#497](https://github.com/reown-com/appkit-react-native/pull/497) [`5b8eb47`](https://github.com/reown-com/appkit-react-native/commit/5b8eb479880eda9c6d799692f5f48153111d16ad) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: round logo from qr code + added borderWidth 0 to card component

- [#519](https://github.com/reown-com/appkit-react-native/pull/519) [`31a73c5`](https://github.com/reown-com/appkit-react-native/commit/31a73c568100e91e3159a270b496b630460e9098) Thanks [@normanzb](https://github.com/normanzb)! - fix: in EventsController, set `NotifyInSync` to true to avoid omitting events

- [#504](https://github.com/reown-com/appkit-react-native/pull/504) [`43a068e`](https://github.com/reown-com/appkit-react-native/commit/43a068e14b84f73c70877268d2dac91a5060c094) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: refactors the theme management logic to introduce a clearer separation between system theme and user-defined default theme

- [#499](https://github.com/reown-com/appkit-react-native/pull/499) [`7d078de`](https://github.com/reown-com/appkit-react-native/commit/7d078de2fb99eedbec13d16eba42a8ce1d3843c7) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: added useAppKitTheme hook

- [#495](https://github.com/reown-com/appkit-react-native/pull/495) [`474a544`](https://github.com/reown-com/appkit-react-native/commit/474a544f8b32e11db3647353d544dfefa8795654) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: updated the switchNetwork to accept a CAIP network ID string

- [#489](https://github.com/reown-com/appkit-react-native/pull/489) [`b2e4801`](https://github.com/reown-com/appkit-react-native/commit/b2e48012c76e9d7aef88fe216ee11709effe0ab8) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: export account list on useAccount hook

- [#498](https://github.com/reown-com/appkit-react-native/pull/498) [`fd620bd`](https://github.com/reown-com/appkit-react-native/commit/fd620bda62118fc0da0b85971c6ed80c9d084592) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - fix: useAccount hook now returns empty array if appkit is not connected

- Updated dependencies [[`5308d3c`](https://github.com/reown-com/appkit-react-native/commit/5308d3c0c02d7e516c3c689bd66308b6d6f6cf7d), [`5b8eb47`](https://github.com/reown-com/appkit-react-native/commit/5b8eb479880eda9c6d799692f5f48153111d16ad), [`31a73c5`](https://github.com/reown-com/appkit-react-native/commit/31a73c568100e91e3159a270b496b630460e9098), [`43a068e`](https://github.com/reown-com/appkit-react-native/commit/43a068e14b84f73c70877268d2dac91a5060c094), [`7d078de`](https://github.com/reown-com/appkit-react-native/commit/7d078de2fb99eedbec13d16eba42a8ce1d3843c7), [`474a544`](https://github.com/reown-com/appkit-react-native/commit/474a544f8b32e11db3647353d544dfefa8795654), [`b2e4801`](https://github.com/reown-com/appkit-react-native/commit/b2e48012c76e9d7aef88fe216ee11709effe0ab8), [`fd620bd`](https://github.com/reown-com/appkit-react-native/commit/fd620bda62118fc0da0b85971c6ed80c9d084592)]:
  - @reown/appkit-common-react-native@2.0.2

## 2.0.1

### Major Changes

- **MULTICHAIN SUPPORT**: Complete architectural overhaul introducing comprehensive multichain support for EVM-compatible chains, Solana, Bitcoin, and more blockchain ecosystems coming soon.

- **SIWX AUTHENTICATION**: Introducing "Sign In With X" feature enabling decentralized authentication across multiple blockchain networks following CAIP-122 standard.

### Added

- **Core Multichain Architecture**:

  - New `@reown/appkit-react-native` core library as the central hub for managing multichain connections, adapters, and events
  - Modular adapter system with dedicated packages for different blockchain ecosystems:
    - `@reown/appkit-ethers-react-native` - EVM support via Ethers.js
    - `@reown/appkit-wagmi-react-native` - EVM support via Wagmi
    - `@reown/appkit-solana-react-native` - Native Solana blockchain support
    - `@reown/appkit-bitcoin-react-native` - Native Bitcoin blockchain support

- **SIWX (Sign In With X) Authentication**:

  - Chain-agnostic authentication framework supporting Ethereum, Polygon, Solana, and more
  - Plugin-based architecture with `siwx` parameter in `createAppKit` configuration
  - **Reown Authentication**: Cloud-managed SIWX sessions with Dashboard integration
  - **Custom Implementation**: `DefaultSIWX` scaffold for custom authentication flows
  - Automatic signature prompts and session management across network switches
  - Session persistence and automatic sign-in for returning users
  - Compliance with CAIP-122 standard for blockchain-based authentication

- **Enhanced Social Login**:

  - **Google Authentication**: Added missing Google social login provider
  - Complete social authentication suite now includes Google, Apple, Facebook, GitHub, Discord, and more

- **Enhanced Configuration**:
  - New `createAppKit` factory function with centralized configuration
  - `adapters` array for pluggable blockchain support
  - `siwx` configuration for authentication setup

### Changed

- ⚠️ **BREAKING: Initialization Process**:
- Replaced monolithic package imports with modular adapter system
- `createAppKit` now requires `adapters` and `networks` arrays instead of chain-specific configs
- `createAppKit` now requires `storage` to handles data persistence
- Configuration moved from adapter-specific functions to centralized `AppKitConfig`

- ⚠️ **BREAKING: Package Structure**:
- Primary entry point changed from `@reown/appkit-wagmi-react-native` or `@reown/appkit-ethers-react-native` to `@reown/appkit-react-native`
- Chain-specific packages now serve as adapters rather than primary libraries
- All hooks and components now imported from `@reown/appkit-react-native`

- ⚠️ **BREAKING: Provider Setup**:
- New `AppKitProvider` wrapper required for all applications
- Wagmi users must now access config via `wagmiAdapter.wagmiConfig`
- Enhanced provider hierarchy supporting multiple blockchain contexts

- **Configuration Options**:
  - `defaultChain` renamed to `defaultNetwork`
  - `chainImages` renamed to `networkImages`
  - New `tokens` property for cross-chain token balance display
  - New `siwx` property for authentication configuration
  - Enhanced metadata and project configuration options

### Deprecated

- **SIWE Authentication**:

  - **SIWE Configuration**: Deprecated in favor of new SIWX authentication system
  - Legacy SIWE setup methods - Use `siwx` parameter with SIWX providers instead

- **Hooks**:
  - `useDisconnect()` - Use `const { disconnect } = useAppKit()` instead
  - All hooks now available from core package

### Migration Required

This is a major release requiring migration for existing applications.

For detailed migration instructions, see: [Migration Guide](https://docs.reown.com/appkit/react-native/core/migration-multichain)

### Documentation

- [Installation Guide](https://docs.reown.com/appkit/react-native/core/installation) for multichain setup
- [Migration Guide](https://docs.reown.com/appkit/react-native/core/migration-multichain) for v2 upgrade
- [SIWX Authentication Guide](https://docs.reown.com/appkit/react-native/core/siwx)

## 2.0.0-alpha.6

### Patch Changes

- [#338](https://github.com/reown-com/appkit-react-native/pull/338) [`53ff4fa`](https://github.com/reown-com/appkit-react-native/commit/53ff4fa9b1ee1531dd34c57f29c9f2f6edcd2e4d) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: bump alpha

- Updated dependencies [[`53ff4fa`](https://github.com/reown-com/appkit-react-native/commit/53ff4fa9b1ee1531dd34c57f29c9f2f6edcd2e4d)]:
  - @reown/appkit-common-react-native@2.0.0-alpha.6

## 2.0.0-alpha.5

### Patch Changes

- [#338](https://github.com/reown-com/appkit-react-native/pull/338) [`59385df`](https://github.com/reown-com/appkit-react-native/commit/59385dffb15556f9c500dea9b2abfacd63251a6b) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - bump alpha

- Updated dependencies [[`59385df`](https://github.com/reown-com/appkit-react-native/commit/59385dffb15556f9c500dea9b2abfacd63251a6b)]:
  - @reown/appkit-common-react-native@2.0.0-alpha.5

## 2.0.0-alpha.4

### Patch Changes

- [#338](https://github.com/reown-com/appkit-react-native/pull/338) [`cd02dbd`](https://github.com/reown-com/appkit-react-native/commit/cd02dbdfc765a05029c1eee2ab32fe365799867d) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: v2 alpha.4

- Updated dependencies [[`cd02dbd`](https://github.com/reown-com/appkit-react-native/commit/cd02dbdfc765a05029c1eee2ab32fe365799867d)]:
  - @reown/appkit-common-react-native@2.0.0-alpha.4

## 2.0.0-alpha.3

### Patch Changes

- [#360](https://github.com/reown-com/appkit-react-native/pull/360) [`f39727b`](https://github.com/reown-com/appkit-react-native/commit/f39727b4785f1c14affa016f72078f531f728297) Thanks [@ignaciosantise](https://github.com/ignaciosantise)! - chore: bump alpha

- Updated dependencies [[`f39727b`](https://github.com/reown-com/appkit-react-native/commit/f39727b4785f1c14affa016f72078f531f728297)]:
  - @reown/appkit-common-react-native@2.0.0-alpha.3

## 2.0.0-alpha.1

### Patch Changes

- f39727b: chore: bump alpha
- Updated dependencies [f39727b]
  - @reown/appkit-common-react-native@2.0.0-alpha.1
