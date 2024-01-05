#!/bin/bash

# Get version from package.json
version=$(awk -F: '/"version":/ {print $2}' package.json | tr -d ' ",')
# File where VERSION is defined
file="src/utils/ConstantsUtil.ts"

# Use sed to replace VERSION
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/VERSION: '.*',/VERSION: '$version',/" $file
else
    # Linux
    sed -i "s/VERSION: '.*',/VERSION: '$version',/" $file
fi
