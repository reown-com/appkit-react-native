#!/bin/bash
set -e
cd "$(dirname "$0")"
cp ../../../node_modules/@walletconnect/ethereum-provider/dist/index.native.js ../../../node_modules/@walletconnect/ethereum-provider/dist/index.es.js
cp ../../../node_modules/@walletconnect/ethereum-provider/dist/index.native.js.map ../../../node_modules/@walletconnect/ethereum-provider/dist/index.es.js.map
