#!/bin/bash
set -e  # Exit on error
set -x  # Print commands

###############################################################################
# iOS Simulator Test Runner
#
# This script sets up iOS simulator, installs apps, captures debug info,
# and runs Maestro tests.
#
# Usage: ./run-ios-tests.sh <working-directory>
###############################################################################
set -e
set -x

WORKING_DIR="${1:-.}"
DEBUG_DIR="$WORKING_DIR/debug-artifacts"
APP_BUNDLE_ID="com.reown.appkit.expomultichain"

###############################################################################
# Setup and Preparation
###############################################################################

# Get the booted simulator UDID
UDID=$(xcrun simctl list devices | grep "(Booted)" | grep -oE '\([0-9A-Fa-f-]+\)' | tr -d '()' | head -n 1)

if [ -z "$UDID" ]; then
    echo "ERROR: No booted simulator found"
    exit 1
fi

echo "Using simulator: $UDID"
export MAESTRO_IOS_DEVICE="$UDID"


echo "Setting up debug directory..."
mkdir -p "$DEBUG_DIR"

###############################################################################
# Install Applications
###############################################################################

echo "=== INSTALLING APPLICATIONS ==="

echo "Installing apps on simulator..."
if [ ! -d "$WORKING_DIR/app-ios-dev.app" ]; then
    echo "ERROR: App not found at $WORKING_DIR/app-ios-dev.app"
    exit 1
fi

if [ ! -d "$WORKING_DIR/wallet.app" ]; then
    echo "ERROR: Wallet app not found at $WORKING_DIR/wallet.app"
    exit 1
fi

xcrun simctl install "$UDID" "$WORKING_DIR/app-ios-dev.app"
xcrun simctl install "$UDID" "$WORKING_DIR/wallet.app"

# Verify installation
echo "Verifying app installation..."
if ! xcrun simctl listapps "$UDID" | grep -qi "expomultichain"; then
    echo "ERROR: App not installed correctly"
    exit 1
fi

# Get app bundle info
echo "App bundle info:" > "$DEBUG_DIR/app_info.txt"
xcrun simctl listapps "$UDID" | grep -A 10 "expomultichain" >> "$DEBUG_DIR/app_info.txt" || true

# Grant permissions
echo "Granting permissions..."
xcrun simctl privacy "$UDID" grant all "$APP_BUNDLE_ID" || true

echo "Waiting for system to settle..."
sleep 5

###############################################################################
# Capture Debug Information
###############################################################################

echo "=== CAPTURING DEBUG INFO ==="

# Device status
echo "Capturing device status..."
xcrun simctl status_bar "$UDID" list > "$DEBUG_DIR/device_status.txt" || true

# Screenshot before tests
echo "Taking screenshot before tests..."
xcrun simctl io "$UDID" screenshot "$DEBUG_DIR/app_state_before_maestro.png" || true

# Try to launch the app manually
echo "Attempting manual app launch..."
if xcrun simctl launch "$UDID" "$APP_BUNDLE_ID"; then
    echo "App launched successfully"
else
    echo "Manual launch returned error, continuing..."
fi

sleep 5

# Screenshot after launch
echo "Taking screenshot after launch..."
xcrun simctl io "$UDID" screenshot "$DEBUG_DIR/app_state_after_launch.png" || true

###############################################################################
# Run Maestro Tests
###############################################################################

echo "=== RUNNING MAESTRO TESTS ==="

# Run tests directly
echo "📱 Running basic smoke test..."
if ! maestro test "$WORKING_DIR/.maestro/basic-smoke-test.yaml"; then
    echo "❌ Basic smoke test failed"
    exit 1
fi

echo ""
echo "📱 Running wallet QR load test..."
if ! maestro test "$WORKING_DIR/.maestro/wallet-qr-load.yaml"; then
    echo "❌ Wallet QR load test failed"
    exit 1
fi

echo ""
echo "📱 Running switch network test..."
if ! maestro test "$WORKING_DIR/.maestro/switch-network.yaml"; then
    echo "❌ Switch network test failed"
    exit 1
fi

echo ""
echo "📱 Running account activity test..."
if ! maestro test "$WORKING_DIR/.maestro/account-activity.yaml"; then
    echo "❌ Account activity test failed"
    exit 1
fi

echo ""
echo "📱 Running send test..."
if ! maestro test "$WORKING_DIR/.maestro/send.yaml"; then
    echo "❌ Send test failed"
    exit 1
fi

echo ""
echo "📱 Running swap test..."
if ! maestro test "$WORKING_DIR/.maestro/swaps.yaml"; then
    echo "❌ Swap test failed"
    exit 1
fi

echo ""
echo "📱 Running onramp test..."
if ! maestro test "$WORKING_DIR/.maestro/onramp.yaml"; then
    echo "❌ Onramp test failed"
    exit 1
fi

echo "All tests passed! ✓"

###############################################################################
# Post-Test Diagnostics
###############################################################################

echo "Capturing final state..."
xcrun simctl io "$UDID" screenshot "$DEBUG_DIR/app_state_after_tests.png" || true

echo "=== TEST RUN COMPLETE ==="

