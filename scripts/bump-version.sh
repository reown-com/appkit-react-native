#!/bin/bash

# Get version from packages/scaffold-utils/package.json
version=$(awk -F: '/"version":/ {print $2}' packages/scaffold-utils/package.json | tr -d ' ",')
# File where VERSION is defined
file="packages/scaffold-utils/src/utils/ConstantsUtil.ts"

# Use sed to replace VERSION
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/VERSION: '.*',/VERSION: '$version',/" $file
else
    # Linux
    sed -i "s/VERSION: '.*',/VERSION: '$version',/" $file
fi
