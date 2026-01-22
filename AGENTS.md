# AppKit React Native SDK

## SDK Overview

**AppKit React Native** is a multichain web3 library by Reown that enables React Native applications to connect users with cryptocurrency wallets and interact with blockchain networks.

### Core Functionality

- **Wallet Connection**: Multi-wallet support via WalletConnect protocol and custom connectors (Coinbase, Phantom, etc.)
- **Multichain Support**: EVM (Ethereum, Polygon, Arbitrum, etc.), Solana, and Bitcoin
- **User Authentication**: Sign-In With X (SIWX) for decentralized authentication
- **DeFi Features**: Token swaps, on-ramp/off-ramp, transaction monitoring
- **Native Modal UI**: Pre-built, customizable React Native components
- **Theme Support**: Light/dark themes with customization options

### Monorepo Structure

```
packages/
├── core/        # Controllers, utilities, core business logic (@reown/appkit-core-react-native)
├── appkit/      # Main SDK entry point, hooks, components (@reown/appkit-react-native)
├── ui/          # Reusable UI components (@reown/appkit-ui-react-native)
├── common/      # Shared types, constants, utilities (@reown/appkit-common-react-native)
├── ethers/      # EVM adapter using ethers.js (@reown/appkit-ethers-react-native)
├── wagmi/       # EVM adapter using wagmi (@reown/appkit-wagmi-react-native)
├── solana/      # Solana blockchain adapter (@reown/appkit-solana-react-native)
├── bitcoin/     # Bitcoin blockchain adapter (@reown/appkit-bitcoin-react-native)
├── coinbase/    # Coinbase wallet connector (@reown/appkit-coinbase-react-native)
└── cli/         # CLI tools (@reown/appkit-cli-react-native)

apps/
├── native/      # Example React Native Expo app
└── gallery/     # UI component showcase
```

### Architectural Patterns

**Controller Pattern (Valtio)**
State management via reactive controllers:

- `ModalController` - Modal visibility and state
- `RouterController` - Navigation between views
- `ConnectionsController` - Wallet connections and networks
- `SwapController` - Token swap operations
- `SendController` - Transfer operations
- `TransactionsController` - Transaction history

**Adapter Pattern**
Blockchain-specific implementations:

- `BlockchainAdapter` - Base interface
- EVM adapters (Ethers, Wagmi)
- Solana adapter
- Bitcoin adapter

**Connector Pattern**
Wallet connection methods:

- `WalletConnectConnector` - Default WalletConnect protocol
- Custom connectors for Coinbase, Phantom, etc.

### Tech Stack

- React Native 0.72+ (tested with 0.76+)
- TypeScript 5.2+
- Valtio (state management)
- WalletConnect v2
- Ethers.js / Wagmi (EVM)
- Solana Web3.js

---

## UI System

### Package Structure

The UI layer is split between two packages:

```
packages/ui/src/              # Reusable UI library (@reown/appkit-ui-react-native)
├── components/               # 11 base primitives (Card, Icon, Text, Image, Modal, etc.)
├── composites/               # 42 feature-rich components (Button, ListItem, InputText, etc.)
├── layout/                   # 3 layout helpers (FlexView, Overlay, Separator)
├── context/                  # ThemeContext and ThemeProvider
├── hooks/                    # useTheme, useAnimatedValue, useCustomDimensions
├── utils/                    # UiUtil, ThemeUtil, TypesUtil, TransactionUtil
└── assets/                   # SVG icons

packages/appkit/src/          # AppKit-specific UI (@reown/appkit-react-native)
├── modal/                    # Modal wrapper and router
├── views/                    # Route views (Connect, Account, Swap, Networks, etc.)
└── partials/                 # 24 AppKit-specific composites (Header, Snackbar, QrCode, etc.)
```

### Component Hierarchy

**Base Components** (`packages/ui/src/components/`):

- `wui-card` - Container with themed background/border
- `wui-icon` - SVG icon renderer (60+ icons)
- `wui-text` - Typography with 23 variants
- `wui-image` - Image loader with error handling
- `wui-modal` - Animated bottom sheet
- `wui-pressable` - Base pressable wrapper
- `wui-shimmer` - Loading skeleton
- `wui-loading-spinner` - Loading indicator

**Composite Components** (`packages/ui/src/composites/`):

- `wui-button` - Primary button (size: sm/md, variant: fill/shade/accent)
- `wui-list-item` - Pressable list item with animations
- `wui-input-text` - Animated text input with focus states
- `wui-card-select` - Wallet/Network selector card
- `wui-tabs` - Animated tab switcher
- `wui-qr-code` - QR code with embedded logo
- `wui-snackbar` - Toast notification
- `wui-avatar` - Address-based avatar with gradient

**Layout Components** (`packages/ui/src/layout/`):

- `FlexView` - Flex container replacing View (supports gap, padding arrays)
- `Overlay` - Semi-transparent overlay
- `Separator` - Divider with optional text

### Theming System

**Theme Colors** (62 keys in DarkTheme/LightTheme):

- `accent-100` to `accent-020` - Primary brand colors
- `fg-100` to `fg-300` - Foreground/text colors
- `bg-100` to `bg-300` - Background colors
- `success-100`, `error-100` - Semantic colors
- `gray-glass-001` to `gray-glass-090` - Glass morphism overlays

**Design Tokens**:

```
Spacing: '0' | '4xs' | '3xs' | '2xs' | 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl'
         0     2       4       6       8      12    14    16    20     24      32      40 (px)

BorderRadius: '5xs' | '4xs' | '3xs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | '3xl' | 'full'
              4       6       8       12      16     20    28    36    80      100 (px)
```

**Typography** (23 variants):

- Sizes: `medium-title`, `small-title`, `large`, `medium`, `paragraph`, `small`, `tiny`, `micro`
- Weights: `400`, `500`, `600`, `700`
- Example: `paragraph-500`, `small-400`, `micro-700`

**Using Theme**:

```typescript
const Theme = useTheme();
// Returns themed color object that responds to light/dark mode
```

### Animation Patterns

Animations use React Native's `Animated` API, preferring the native driver for GPU-accelerated properties (opacity, transforms) and falling back to `useNativeDriver: false` when animating unsupported properties like colors.

**Modal Animation** (native driver):

- Opening: Spring physics (damping: 25, stiffness: 220)
- Closing: Timing animation (150ms) for snappy UX
- Backdrop: Opacity fade (300ms in, 250ms out)

**Component Animations** (JS-driven, `useNativeDriver: false`):

- `useAnimatedValue` hook for color interpolation on press states
- `Animated.createAnimatedComponent(Pressable)` for interactive elements
- Color transitions between normal/pressed states

### Views and Router

**RouterController** manages navigation between views defined in `RouterControllerState` (see `packages/core/src/controllers/RouterController.ts` for the up-to-date list of route IDs).

View categories:

- Account flows (account overview and default account views)
- Connection flows (social logins, external wallets, WalletConnect, etc.)
- Network management (network selection, switching, unsupported network messaging)
- On-ramp experiences (on-ramp setup, checkout, loading, settings)
- Swap flows (swap entry and swap preview/review)
- Wallet actions (receiving, sending, send preview/review)
- Informational views (e.g., "What is a network?", "What is a wallet?")

**View Pattern**:

```typescript
export function MyView() {
  const snapshot = useSnapshot(ControllerState);
  const { padding } = useCustomDimensions();

  return (
    <ScrollView style={{ paddingHorizontal: padding }}>
      <FlexView padding={['xs', '0', 'xs', '0']}>{/* Content */}</FlexView>
    </ScrollView>
  );
}
```

### Common UI Patterns

**FlexView Layout**:

```typescript
<FlexView
  flexDirection="row"
  alignItems="center"
  justifyContent="space-between"
  padding={['l', 'xl', 's', 'xl']}  // [top, right, bottom, left]
>
```

**List Item**:

```typescript
<ListItem icon="wallet" imageSrc={imageUrl} chevron onPress={handlePress} loading={isLoading}>
  <Text variant="paragraph-500" color="fg-100">
    {name}
  </Text>
</ListItem>
```

**Button**:

```typescript
<Button size="md" variant="fill" onPress={handlePress}>
  Connect Wallet
</Button>
```

### UI Guidelines for Agents

1. **Use existing components** - Never create custom primitives; use the `wui-*` components
2. **Follow theme system** - All colors must come from theme, no hardcoded hex values
3. **Use FlexView** - Prefer FlexView over View for layout consistency
4. **Spacing tokens** - Use spacing tokens ('xs', 's', 'm', etc.) not pixel values
5. **Animation consistency** - Use `useAnimatedValue` hook for press state animations
6. **Memoize list items** - Use `React.memo` with custom comparison for expensive list items
7. **Test both themes** - Verify changes work in both light and dark mode

---

## Agent Guidance

### Code Quality Requirements

**Before pushing any solution, always run:**

```bash
yarn format   # Prettier formatting
yarn lint     # ESLint checks
yarn test     # Jest tests
```

Follow existing code style in the codebase. Do not deviate from established patterns.

### Platform Compatibility

This SDK must work for both **Expo** and **React Native CLI** projects. Ensure any changes are compatible with both environments.

### Dependency Policy

**Keep external third-party dependencies minimal.** Avoid adding new libraries if possible - the SDK must remain lightweight. If a new dependency is absolutely necessary, justify it clearly.

### Key Abstractions

- **Adapters**: Blockchain-specific implementations (one per chain type)
- **Connectors**: Wallet connection methods
- **Controllers**: Valtio-based reactive state containers
- **Namespaces**: CAIP-style chain identifiers (e.g., `eip155:1` for Ethereum mainnet)
- **CAIP Addresses**: Chain-agnostic addresses (e.g., `eip155:1:0x...`)

### Important Files

```
packages/appkit/src/AppKit.ts          # Main SDK class (~900 LOC)
packages/appkit/src/hooks/             # React hooks (useAppKit, useAccount, etc.)
packages/core/src/controllers/         # State management controllers
packages/common/src/                   # Shared types and network definitions
packages/ethers/src/adapter.ts         # EVM adapter implementation
packages/solana/src/                   # Solana adapter
packages/bitcoin/src/                  # Bitcoin adapter
```

### Development Commands

```bash
yarn install          # Install dependencies
yarn ios              # Run example on iOS simulator
yarn android          # Run example on Android emulator
yarn build            # Build all packages
yarn lint             # Run ESLint
yarn test             # Run Jest tests
yarn format           # Run Prettier
```

### Commit Convention

Follow conventional commits: `fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`

### Dependabot Alerts

When resolving Dependabot security alerts or dependency update PRs:

1. **Direct dependencies** - Update the version directly in the package's `package.json` where it's declared. This is cleaner than using resolutions because:

   - It keeps the dependency version visible where the package is used
   - Resolutions are meant for transitive dependencies you don't control
   - Example: update storybook in `apps/gallery/package.json`, not via root resolutions

2. **Transitive dependencies** - Use resolutions/overrides for dependencies you don't directly declare:

   - Root `package.json` → `resolutions` field (for yarn workspaces)
   - Specific package's `package.json` → `overrides` field (for npm packages like expo-multichain)

3. **Update lockfiles** - After making changes:

   - Run `yarn install` at root to update `yarn.lock`
   - Run `npm install` in the specific package directory to update `package-lock.json`

4. **Check for related packages** - When updating a package, check if there are related packages that should be updated together (e.g., updating `storybook` should also update all `@storybook/*` addons to the same version for consistency)

5. **Never update to new major versions** - Only apply patch/minor updates. Major version bumps can cause breaking changes and compatibility issues.

6. **Run formatting before committing** - Always run `yarn format` to fix any prettier issues before creating a commit.
