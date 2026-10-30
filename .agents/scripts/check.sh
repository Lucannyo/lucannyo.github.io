#!/bin/sh
set -eu

cd "$(dirname "$0")/../.."
node --check app.js
node --check test.cjs
node test.cjs
python3 -m unittest test_server.py
git diff --check
git diff --cached --check
