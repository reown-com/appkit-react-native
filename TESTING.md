# Testing Setup

This document describes the testing setup for the WalletConnect AppKit React Native project.

## Shared Jest Setup

To avoid duplication and ensure consistency across packages, we use a shared Jest setup approach:

### Structure

- `jest-shared-setup.ts`: Contains common mocks used across all packages
- Package-specific `jest-setup.ts` files: Import the shared setup and add package-specific mocks

### How it works

1. The root `jest.config.ts` defines a moduleNameMapper that maps `@shared-jest-setup` to the shared setup file:

```js
moduleNameMapper: {
  '^@shared-jest-setup$': '<rootDir>/jest-shared-setup.ts'
}
```

2. Each package's `jest.config.ts` overrides this mapping to use a relative path:

```js
moduleNameMapper: {
  '^@shared-jest-setup$': '../../jest-shared-setup.ts'
}
```

3. Each package has its own `jest-setup.ts` file that imports the shared setup and only adds package-specific mocks:

```js
// Import shared setup
import '@shared-jest-setup';

// Import helper functions from shared setup (if needed)
import { mockThemeContext, mockUseTheme } from '@shared-jest-setup';

// Apply package-specific mocks
mockThemeContext('../src/context/ThemeContext');
mockUseTheme('../src/hooks/useTheme');

// Add any other package-specific mocks here if needed
```

### Shared Mocks

The shared setup includes mocks for:

- `@react-native-async-storage/async-storage`
- React Native components and APIs (StyleSheet, Dimensions, Platform, etc.)
- `react-native-svg` components
- Helper functions for mocking package-specific modules

All common mocks are centralized in the shared setup file, eliminating duplication across packages. This makes the testing setup more maintainable and consistent.

### Adding New Mocks

To add a new mock that should be shared across packages:

1. Add it to `jest-shared-setup.ts`
2. If it's a function that needs to be imported by packages, export it from `jest-shared-setup.ts`

For package-specific mocks, add them to the package's `jest-setup.ts` file.

### Type Declarations

Each package includes a type declaration file for the shared setup module:

```ts
// types/shared-jest-setup.d.ts
declare module '@shared-jest-setup' {
  export function mockThemeContext(modulePath: string): void;
  export function mockUseTheme(modulePath: string): void;
}
```

### Resetting controller state

Core controllers are module-level valtio singletons, so state set in one test leaks into the next. Use `resetControllers()` to restore every core controller to its initial state:

```ts
import { resetControllers } from '@shared-jest-setup';

afterEach(() => {
  resetControllers();
});
```

Importing `@shared-jest-setup` from a test file needs an absolute mapping in the package's `jest.config.ts` (see `packages/core/jest.config.ts`) and the `resetControllers` declaration in `types/shared-jest-setup.d.ts`.

Prefer `jest.useFakeTimers()` over real `setTimeout` waits in tests.

## Running Tests

To run tests for all packages:

```bash
yarn test
```

To run tests for a specific package:

```bash
yarn workspace @reown/appkit-[package-name]-react-native test
```

To run all tests with coverage (what CI runs):

```bash
yarn test:coverage
```

`packages/appkit` and `packages/core` set a `coverageThreshold` for critical files (`AppKit.ts`, `ConnectionsController.ts`, `StorageUtil.ts`). It's enforced only with `--coverage`, at the level measured when it was added, so it only catches regressions. Raise it when you add tests.

## Playwright Testing (E2E)

End-to-end tests run against the example app's web build (Expo web) using Playwright. They run in CI via `.github/workflows/e2e.yml`.

### Structure

- Tests: `apps/native/tests/*.spec.ts` (shared helpers in `apps/native/tests/shared/`)
- Config: `apps/native/playwright.config.ts`

### Running

From the repo root:

```bash
yarn playwright:test        # runs all e2e specs (via apps/native)
```

Or from `apps/native`:

```bash
yarn playwright:install                        # install the chromium browser (first time)
yarn playwright test tests/wallet.spec.ts      # run a single spec
yarn playwright test --debug                   # step through with the Playwright Inspector
```

An HTML report is written to `apps/native/playwright-report/`; open it with `yarn playwright show-report`.

For more information, refer to the [Playwright documentation](https://playwright.dev/docs/intro).
