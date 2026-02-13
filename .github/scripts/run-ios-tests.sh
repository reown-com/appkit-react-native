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
MAX_RETRIES=2

for test_pair in "${tests[@]}"; do
  test_file="${test_pair%%:*}"
  test_name="${test_pair##*:}"
  
  echo ""
  echo "📱 Running $test_name..."
  
  # Record start time
  start_time=$(date +%s)

  # Retry logic
  attempt=0
  test_passed=false

  while [ $attempt -le $MAX_RETRIES ]; do
    if [ $attempt -gt 0 ]; then
      echo "⚠️  Retry attempt $attempt for $test_name..."
      sleep 3  # Brief pause between retries
    fi
    
    if (cd "$WORKING_DIR/.maestro" && maestro test "$test_file.yaml"); then
      test_passed=true
      break
    else
      attempt=$((attempt + 1))
    fi
  done
  
  end_time=$(date +%s)
  duration=$((end_time - start_time))
  
  if [ "$test_passed" = true ]; then
    echo "✅ $test_name passed (${duration}s)"
    if [ $attempt -gt 0 ]; then
      test_results="${test_results}✅ $test_name (${duration}s, passed after $attempt retries)\n"
    else
      test_results="${test_results}✅ $test_name (${duration}s)\n"
    fi
    passed_count=$((passed_count + 1))
  else
    echo "❌ $test_name failed after $MAX_RETRIES retries (${duration}s)"
    test_results="${test_results}❌ $test_name (${duration}s, failed after $MAX_RETRIES retries)\n"
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

echo "Capturing final state..."
xcrun simctl io "$UDID" screenshot "$DEBUG_DIR/app_state_after_tests.png" || true

echo "=== TEST RUN COMPLETE ==="

