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
WALLET_PACKAGE="com.walletconnect.web3wallet.rnsample.internal"

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

# Track test results for GitHub Actions output
# Define tests array: filename:display_name
tests=(
  "basic-smoke-test:Basic Smoke Test"
  "wallet-qr-load:Wallet QR Load"
  "switch-network:Switch Network"
  "account-activity:Account Activity"
  "send:Send"
  "swaps:Swaps"
  "onramp:Onramp"
)

# Initialize result tracking
test_results=""
failed_tests=""
passed_count=0
failed_count=0

# Run each test and track results
for test_pair in "${tests[@]}"; do
  test_file="${test_pair%%:*}"
  test_name="${test_pair##*:}"
  
  echo ""
  echo "📱 Running $test_name..."
  
  # Record start time
  start_time=$(date +%s)
  
  if (cd "$WORKING_DIR/.maestro" && maestro test "$test_file.yaml"); then
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo "✅ $test_name passed (${duration}s)"
    test_results="${test_results}✅ $test_name (${duration}s)\n"
    passed_count=$((passed_count + 1))
  else
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    echo "❌ $test_name failed (${duration}s)"
    test_results="${test_results}❌ $test_name (${duration}s)\n"
    failed_tests="${failed_tests}• $test_name\n"
    failed_count=$((failed_count + 1))
  fi
done

# Output results to GitHub Actions
if [ -n "$GITHUB_OUTPUT" ]; then
  echo "test_results<<EOF" >> "$GITHUB_OUTPUT"
  echo -e "$test_results" >> "$GITHUB_OUTPUT"
  echo "EOF" >> "$GITHUB_OUTPUT"
  
  echo "failed_tests<<EOF" >> "$GITHUB_OUTPUT"
  echo -e "$failed_tests" >> "$GITHUB_OUTPUT"
  echo "EOF" >> "$GITHUB_OUTPUT"
  
  echo "passed_count=$passed_count" >> "$GITHUB_OUTPUT"
  echo "failed_count=$failed_count" >> "$GITHUB_OUTPUT"
fi

# Print summary
echo ""
echo "=== TEST SUMMARY ==="
echo "Passed: $passed_count"
echo "Failed: $failed_count"
echo ""
echo -e "$test_results"

# Exit with error if any tests failed
if [ $failed_count -gt 0 ]; then
  echo "Some tests failed"
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

