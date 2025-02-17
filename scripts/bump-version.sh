#!/bin/bash

# Get version from core
version=$(awk -F: '/"version":/ {print $2}' packages/core/package.json | tr -d ' ",')


utils="packages/common/src/utils/ConstantsUtil.ts"
rootjson="package.json"

# Replace version in ConstantsUtil.ts
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/VERSION: '.*',/VERSION: '$version',/" $utils
else
    # Linux
    sed -i "s/VERSION: '.*',/VERSION: '$version',/" $utils
fi

# Replace version in root package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$version\"/" $rootjson
else
    # Linux
    sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" $rootjson
fi
