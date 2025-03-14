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

## Running Tests

To run tests for all packages:

```bash
yarn test
```

To run tests for a specific package:

```bash
yarn workspace @reown/appkit-[package-name]-react-native test
```

## Playwright Testing

For end-to-end testing of web interfaces (such as the web demo or web views within the React Native app), we use Playwright.

### Setup

1. Install Playwright:

```bash
# Install Playwright and browsers
npx playwright install
```

2. Playwright tests are located in the `e2e` directory at the root of the project.

### Writing Tests

Playwright tests are written using the Playwright Test framework. Here's a basic example:

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://your-app-url.com');

  // Interact with the page
  await page.click('text=Sign In');
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Assert the result
  await expect(page.locator('.welcome-message')).toContainText('Welcome');
});
```

### Running Playwright Tests

To run all Playwright tests:

```bash
npx playwright test
```

To run a specific test file:

```bash
npx playwright test e2e/example.spec.ts
```

To run tests in headed mode (with browser visible):

```bash
npx playwright test --headed
```

To run tests in a specific browser:

```bash
npx playwright test --browser=chromium
# or
npx playwright test --browser=firefox
# or
npx playwright test --browser=webkit
```

### Debugging Playwright Tests

To debug tests:

1. Run with the `--debug` flag:

```bash
npx playwright test --debug
```

2. Use the Playwright Inspector to step through the test.

3. Add `await page.pause()` in your test to pause at a specific point.

### Generating Test Reports

To generate an HTML report:

```bash
npx playwright test --reporter=html
```

Then open the report:

```bash
npx playwright show-report
```

### Testing Mobile Web Views

For testing mobile web views:

```typescript
test('mobile view test', async ({ browser }) => {
  // Create a new context with mobile device emulation
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  // Continue with your test...
});
```

### CI Integration

Playwright tests can be integrated into your CI pipeline. Here's an example GitHub Actions workflow:

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: yarn install
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

For more information, refer to the [Playwright documentation](https://playwright.dev/docs/intro).
