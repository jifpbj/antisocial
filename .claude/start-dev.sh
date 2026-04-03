#!/usr/bin/env bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
cd "$(dirname "$0")/.." || exit 1
exec /opt/homebrew/bin/node node_modules/next/dist/bin/next dev
