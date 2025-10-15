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

WORKING_DIR="${1:-.}"
DEBUG_DIR="$WORKING_DIR/debug-artifacts"
APP_BUNDLE_ID="com.reown.appkit.expomultichain"
SIM_DEVICE_NAME="iPhone-15-Maestro-Test"
SIM_DEVICE_TYPE="iPhone 15"

###############################################################################
# Setup and Preparation
###############################################################################

echo "Setting up debug directory..."
mkdir -p "$DEBUG_DIR"

###############################################################################
# Setup iOS Simulator
###############################################################################

echo "=== SETTING UP iOS SIMULATOR ==="

# Find iOS runtime (prefer iOS 18, fallback to latest available)
echo "Finding iOS runtime..."
SIM_RUNTIME_ID=$(xcrun simctl list runtimes | grep -E "iOS 18" | awk '{print $NF}' | head -n 1)

if [ -z "$SIM_RUNTIME_ID" ]; then
    echo "iOS 18 not found, using latest available iOS runtime..."
    SIM_RUNTIME_ID=$(xcrun simctl list runtimes | grep "iOS" | awk '{print $NF}' | tail -n 1)
fi

if [ -z "$SIM_RUNTIME_ID" ]; then
    echo "ERROR: No iOS runtime found"
    exit 1
fi

echo "Using iOS runtime: $SIM_RUNTIME_ID"

# Create or get existing simulator
echo "Creating/getting simulator..."
UDID=$(xcrun simctl create "$SIM_DEVICE_NAME" "$SIM_DEVICE_TYPE" "$SIM_RUNTIME_ID" 2>/dev/null || \
       xcrun simctl list devices | grep "$SIM_DEVICE_NAME" | grep -oE '\([0-9A-F-]+\)' | tr -d '()')

if [ -z "$UDID" ]; then
    echo "ERROR: Failed to create or find simulator"
    exit 1
fi

echo "Simulator UDID: $UDID"

# Boot the simulator
echo "Booting simulator..."
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b

# Export UDID for Maestro
export MAESTRO_IOS_DEVICE="$UDID"

echo "Waiting for simulator to be fully ready..."
sleep 5

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

TEST_SCRIPT="$WORKING_DIR/.maestro/run-tests.sh"

if [ ! -f "$TEST_SCRIPT" ]; then
    echo "ERROR: Test script not found at $TEST_SCRIPT"
    exit 1
fi

# Make sure the script is executable
chmod +x "$TEST_SCRIPT"

# Run the test script from the working directory
echo "Running test suite via $TEST_SCRIPT..."
cd "$WORKING_DIR"
if ! "$TEST_SCRIPT"; then
    echo "ERROR: Test suite failed"
    exit 1
fi

echo "All tests passed! ✓"

###############################################################################
# Post-Test Diagnostics
###############################################################################

echo "Capturing final state..."
xcrun simctl io "$UDID" screenshot "$DEBUG_DIR/app_state_after_tests.png" || true

echo "=== TEST RUN COMPLETE ==="

