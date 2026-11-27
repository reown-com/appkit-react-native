# AppKit React Native SDK

**AppKit React Native** is a multichain web3 SDK by Reown that connects React Native apps to crypto wallets and blockchains: wallet connections via the WalletConnect protocol plus custom connectors (Coinbase, Phantom, etc.), EVM / Solana / Bitcoin support, SIWX authentication, swaps, on-ramp, and a prebuilt themeable modal UI.

Tech stack: React Native 0.72+ (example app on 0.76), TypeScript 5.2, Valtio, WalletConnect v2, ethers.js / wagmi, Solana Web3.js.

Public (consumer-facing) documentation: https://docs.reown.com/appkit/react-native/core/installation — useful for checking the documented public API when changing SDK behavior.

## Monorepo Structure

```
packages/
├── core/        # Controllers, utilities, business logic (@reown/appkit-core-react-native)
├── appkit/      # Main SDK entry: hooks, modal, views, partials (@reown/appkit-react-native)
├── ui/          # Reusable UI components (@reown/appkit-ui-react-native)
├── common/      # Shared types, constants, network definitions (@reown/appkit-common-react-native)
├── ethers/      # EVM adapter using ethers.js
├── wagmi/       # EVM adapter using wagmi
├── solana/      # Solana adapter
├── bitcoin/     # Bitcoin adapter
├── coinbase/    # Coinbase wallet connector
└── cli/         # CLI tools

apps/
├── native/      # Example React Native Expo app (yarn ios / yarn android)
└── gallery/     # UI component showcase (Storybook)

examples/
└── expo-multichain/  # Standalone npm example app — NOT part of the yarn workspace,
                      # so yarn build/test don't cover it. Has its own package-lock.json.
```

## Architecture

- **Controllers** (Valtio reactive state) in `packages/core/src/controllers/`: `ModalController`, `RouterController`, `ConnectionsController`, `SwapController`, `SendController`, `TransactionsController`, etc. Views subscribe via `useSnapshot(ControllerState)`.
- **Adapters** — blockchain-specific implementations of the `BlockchainAdapter` interface: ethers/wagmi (EVM), solana, bitcoin.
- **Connectors** — wallet connection methods: `WalletConnectConnector` (default) plus custom ones (Coinbase, Phantom).
- **Namespaces / CAIP** — CAIP-style chain identifiers (`eip155:1`) and addresses (`eip155:1:0x...`).
- **Routing** — `RouterController` navigates between views in `packages/appkit/src/views/`; the up-to-date list of route ids lives in `RouterControllerState` (`packages/core/src/controllers/RouterController.ts`).

Key files:

```
packages/appkit/src/AppKit.ts          # Main SDK class
packages/appkit/src/hooks/             # useAppKit, useAccount, etc.
packages/core/src/controllers/         # State management controllers
packages/common/src/                   # Shared types and network definitions
packages/ethers/src/adapter.ts         # EVM adapter implementation
```

## UI System

The UI layer is split between two packages:

- `packages/ui/src/` — the reusable library: `components/` (base primitives, `wui-*` names), `composites/` (feature-rich components like Button, ListItem, InputText), `layout/` (`FlexView`, `Overlay`, `Separator`), `hooks/` (`useTheme`, `useAnimatedValue`, `useCustomDimensions`), `utils/` (ThemeUtil holds all color/spacing/typography tokens), `assets/` (SVG icons).
- `packages/appkit/src/` — AppKit-specific UI: `modal/`, `views/` (route views), `partials/` (`w3m-*` composites like header, snackbar, QR code).

### UI Guidelines

1. **Use existing components** — never create custom primitives; use the `wui-*` components.
2. **Follow the theme system** — all colors come from `useTheme()`; no hardcoded hex values. Works in both light and dark mode — test both.
3. **Use FlexView** — prefer it over `View`; it supports `gap` and padding arrays (`padding={['l', 'xl', 's', 'xl']}` = [top, right, bottom, left]).
4. **Use design tokens** — spacing ('xs', 's', 'm', …), border radius, and typography variants ('paragraph-500', 'small-400', …) are defined in `packages/ui/src/utils/ThemeUtil.ts`; don't use raw pixel values.
5. **Animations** — React Native `Animated` API; native driver for opacity/transforms, `useNativeDriver: false` only for unsupported properties like colors. Use the `useAnimatedValue` hook for press-state color transitions.
6. **Memoize list items** — `React.memo` with a custom comparison for expensive list items.

When building a view, copy the pattern of an existing one in `packages/appkit/src/views/` (useSnapshot + useCustomDimensions + FlexView).

## Development

```bash
yarn install          # Install dependencies
yarn ios              # Run example on iOS simulator
yarn android          # Run example on Android emulator
yarn build            # Build all packages
```

Running the example app requires a Reown ProjectID: copy `apps/native/.env.example` to `apps/native/.env` and set `EXPO_PUBLIC_PROJECT_ID` (create one at https://dashboard.reown.com). Unit tests and builds need no environment setup.

**Before pushing any solution, always run:**

```bash
yarn format   # Prettier
yarn lint     # ESLint
yarn test     # Jest
```

### Testing changes

- Unit tests live in each package's `src/__tests__/`. Run one package's tests with `yarn workspace @reown/appkit-<name>-react-native test` (faster than the root `yarn test`).
- Jest mocks are shared via `jest-shared-setup.ts`, imported as `@shared-jest-setup` in each package's `jest-setup.ts` — read `TESTING.md` before adding mocks; put shared mocks there, package-specific ones in the package's `jest-setup.ts`.
- New logic in controllers/utils/adapters should come with unit tests following the existing patterns in the package's `__tests__/` folder.
- E2E (Playwright) tests live in `apps/native/tests/`; run them with `yarn playwright:test` from the root (CI runs them on every PR via `.github/workflows/e2e.yml`; tests that only pass on retry are reported as flaky in the job summary). See `TESTING.md` for details.
- Maestro flows for the native example app live in `examples/expo-multichain/.maestro/`. CI (`.github/workflows/expo-ci-cd.yml`) runs them on Android and iOS for every push to a PR against `develop`/`main` that touches `packages/**`, and on manual `workflow_dispatch`. Update the flows when you change UI labels or test IDs they rely on.
- Manual verification: run the example app (`yarn ios` / `yarn android`) for SDK behavior, and `apps/gallery` (Storybook) for isolated UI component changes.

Rules:

- Follow existing code style; do not deviate from established patterns.
- The SDK must work in both **Expo** and **React Native CLI** projects.
- **Keep third-party dependencies minimal** — avoid new libraries; justify any that are absolutely necessary.
- Conventional commits: `fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Changesets: a changeset must list **all published packages** (they are versioned together), not only the one you changed. Exception: `@reown/appkit-react-native-cli` is versioned separately — include it only when the CLI itself changes.

## Dependency Updates / Dependabot

1. **Direct dependencies** — update the version in the `package.json` that declares it (e.g. storybook in `apps/gallery/package.json`), not via root resolutions.
2. **Transitive dependencies** — use root `resolutions` (yarn workspaces) or the package's `overrides` field (npm packages like `examples/expo-multichain`).
3. **Lockfiles** — run `yarn install` at root for `yarn.lock`; run `npm install` inside `examples/expo-multichain` for its `package-lock.json`. Verify that example still bundles with `npx expo export`.
4. **Related packages** — update families together (e.g. `storybook` + all `@storybook/*` addons to the same version).
5. **Never bump major versions** — patch/minor only.
6. Run `yarn format` before committing.

## Pull Requests

- Opening a PR or refreshing its description: `/pr-handoff` (`.claude/skills/pr-handoff/`), which writes the agent blocks through `/visual-recap`.
- `Why`, `Decisions`, `Worth looking at` and the Breaking change checkbox in `.github/pull_request_template.md` are author-owned. Never write them unless the author supplies or approves the exact text in the current conversation.
