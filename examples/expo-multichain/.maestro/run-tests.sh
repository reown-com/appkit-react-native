#!/bin/bash

# Run Maestro Tests
# This script runs all maestro tests in the .maestro directory

set -e

echo "🧪 Running Maestro tests..."

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo "❌ Maestro is not installed. Please install it first:"
    echo "   macOS: brew tap mobile-dev-inc/tap && brew install maestro"
    echo "   Linux/Windows: curl -Ls \"https://get.maestro.mobile.dev\" | bash"
    exit 1
fi

# Create screenshots directory if it doesn't exist
mkdir -p .maestro/screenshots

# Run tests
echo "📱 Running basic smoke test..."
maestro test .maestro/basic-smoke-test.yaml || {
    echo "❌ Basic smoke test failed"
    exit 1
}

echo ""
echo "📱 Running wallet QR load test..."
maestro test .maestro/wallet-qr-load.yaml || {
    echo "❌ Wallet QR load test failed"
    exit 1
}

echo ""
echo "📱 Running connection test..."
maestro test .maestro/connect-wallet.yaml || {
    echo "❌ Detailed connection test failed"
    exit 1
}


echo ""
echo "✅ All tests passed!"
echo "📸 Screenshots saved to .maestro/screenshots/"

