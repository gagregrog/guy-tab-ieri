#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -f guy-tab-ieri.xpi
zip guy-tab-ieri.xpi -j extension/manifest.json extension/popup.html extension/popup.js extension/icon.png extension/guy-hot-dogs.png
echo "Built guy-tab-ieri.xpi"
