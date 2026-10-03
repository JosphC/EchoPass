#!/bin/sh
# Shared start: reinstall deps if a bind-mount hid the image node_modules.
set -eu
if [ ! -d node_modules/expo ]; then
  npm ci
fi
exec "$@"
