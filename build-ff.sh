#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -f guy-tab-ieri.xpi
cd extension
zip -r ../guy-tab-ieri.xpi manifest.json popup.html popup.js icon.png guy-hot-dogs.png fieri/
cd ..
echo "Built guy-tab-ieri.xpi"
