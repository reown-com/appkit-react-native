#!/bin/bash
set -e  # Exit on error
set -x  # Print commands

###############################################################################
# Android Emulator Test Runner
# 
# This script installs apps on Android emulator, captures debug info,
# and runs Maestro tests.
#
# Usage: ./run-android-tests.sh <working-directory>
###############################################################################

WORKING_DIR="${1:-.}"
DEBUG_DIR="$WORKING_DIR/debug-artifacts"
APP_PACKAGE="com.reown.appkit.expomultichain"
WALLET_PACKAGE="com.walletconnect.web3modal.rnsample"

###############################################################################
# Setup and Preparation
###############################################################################

echo "Setting up debug directory..."
mkdir -p "$DEBUG_DIR"

echo "Waiting for emulator to be ready..."
adb wait-for-device

echo "Waiting for boot completion..."
adb shell 'while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 2; done'
echo "Boot completed!"
adb devices

###############################################################################
# Start Logcat Capture
###############################################################################

echo "Starting logcat capture..."
adb logcat -c
adb logcat > "$DEBUG_DIR/full-logcat.txt" &
LOGCAT_PID=$!

# Ensure logcat is killed on script exit
trap "kill $LOGCAT_PID 2>/dev/null || true" EXIT

###############################################################################
# Install Applications
###############################################################################

echo "Installing APKs..."
adb install -r "$WORKING_DIR/app-dev.apk"
adb install -r "$WORKING_DIR/wallet.apk"

echo "Verifying app installation..."
if ! adb shell pm list packages | grep -q "$APP_PACKAGE"; then
    echo "ERROR: App not installed correctly"
    exit 1
fi

if ! adb shell pm list packages | grep -q "$WALLET_PACKAGE"; then
    echo "ERROR: Wallet not installed correctly"
    exit 1
fi

echo "Checking APK details:"
adb shell dumpsys package "$APP_PACKAGE" | grep -A 5 "versionName" || true

echo "Clearing app data for clean state..."
adb shell pm clear "$APP_PACKAGE" || true

echo "Waiting for system to settle..."
sleep 5

###############################################################################
# Capture Debug Information
###############################################################################

echo "=== CAPTURING DEBUG INFO ==="

# Network state (critical for WalletConnect)
echo "Capturing network state..."
{
    echo "Network state:"
    adb shell dumpsys connectivity
    adb shell settings get global airplane_mode_on
} > "$DEBUG_DIR/network_state.txt"

# Memory info
echo "Capturing memory info..."
adb shell dumpsys meminfo "$APP_PACKAGE" > "$DEBUG_DIR/meminfo.txt" || true

# Process info
echo "Capturing process info..."
adb shell ps | grep reown > "$DEBUG_DIR/processes.txt" || true

# Manual app launch test
echo "Attempting manual app launch..."
adb shell monkey -p "$APP_PACKAGE" -c android.intent.category.LAUNCHER 1
sleep 5

# Verify app is running
if ! adb shell ps | grep -q "$APP_PACKAGE"; then
    echo "WARNING: App may not be running"
fi

# Screenshot before tests
echo "Taking screenshot..."
adb shell screencap /sdcard/app_state_before_maestro.png
adb pull /sdcard/app_state_before_maestro.png "$DEBUG_DIR/" || true

# Current activity
echo "Current activity before Maestro:"
adb shell dumpsys activity activities | grep -E "mResumedActivity|mFocusedActivity" || true

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

echo "Checking for crashes..."
if adb logcat -d | grep -E "FATAL EXCEPTION|AndroidRuntime|Process:.*com.reown" > "$DEBUG_DIR/crashes.txt"; then
    echo "WARNING: Crashes detected, check $DEBUG_DIR/crashes.txt"
else
    echo "No crashes found" > "$DEBUG_DIR/crashes.txt"
fi

echo "=== TEST RUN COMPLETE ==="

