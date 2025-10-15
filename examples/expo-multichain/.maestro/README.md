# Maestro Tests for Expo Multichain

This directory contains Maestro test flows for the AppKit React Native example app.

## Test Files

- `basic-smoke-test.yaml` - Basic test that verifies app launch and modal opening
- `wallet-qr-load.yaml` - Basic test that verifies if the WalletConnect QR Code loads
- `switch-network.yaml` - Tests switching between different blockchain networks
- `account-activity.yaml` - Tests viewing account activity and transaction history
- `send.yaml` - Tests the send transaction flow
- `swaps.yaml` - Tests token swap functionality
- `onramp.yaml` - Tests fiat onramp purchase flow

## Running Tests Locally

### Prerequisites

Install Maestro CLI:

**macOS:**

```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

**Linux/Windows:**

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Run Tests

**iOS Simulator:**

```bash
# Start the app first
cd examples/expo-multichain
npm run ios

# In another terminal, run tests
maestro test .maestro/basic-smoke-test.yaml
```

**Android Emulator:**

```bash
# Start the app first
cd examples/expo-multichain
npm run android

# In another terminal, run tests
maestro test .maestro/basic-smoke-test.yaml
```

**Run all tests:**

```bash
maestro test .maestro/
```

## CI/CD Integration

The tests are integrated into the GitHub Actions workflow and run automatically on every PR.

## Updating Tests

When you update the UI or change button labels/IDs, make sure to update the corresponding test files.

### Common Selectors

- Text content: `"Button Text"`
- Test ID: `id: "component-test-id"`
- Index: `index: 0`

### Debugging

Add `takeScreenshot` commands to capture the current state:

```yaml
- takeScreenshot: screenshots/debug-state
```

View screenshots in the test results or locally in `.maestro/screenshots/`.

## Test Structure

Each test follows this pattern:

1. Launch app
2. Wait for UI to load
3. Interact with elements
4. Assert expected state
5. Take screenshots for verification

## Troubleshooting

### Test fails with "Element not found"

- Check if the text/id exists in the app
- Increase timeout values
- Add `waitForAnimationToEnd` before assertions

### Emulator issues

- Make sure emulator/simulator is running before tests
- Check that the app is properly installed
- Grant necessary permissions (notifications, etc.)

### Screenshots not captured

- Check file permissions in the `.maestro/screenshots/` directory
- Ensure the path exists before running tests
