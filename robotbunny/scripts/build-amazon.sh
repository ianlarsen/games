#!/bin/sh
# Same offline runtime as Google Play. Release signing uses ROBOT_BUNNY_* env vars.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec "$SCRIPT_DIR/build-android.sh" :app:assembleRelease :app:lintRelease "$@"
