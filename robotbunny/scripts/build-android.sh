#!/bin/sh
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROBOT_BUNNY_TOOLCHAIN_ROOT=${ROBOT_BUNNY_TOOLCHAIN_ROOT:-"$HOME/Documents/Codex/Toolchains"}
export JAVA_HOME=${JAVA_HOME:-"$ROBOT_BUNNY_TOOLCHAIN_ROOT/java-17/Contents/Home"}
export ANDROID_HOME=${ANDROID_HOME:-"$ROBOT_BUNNY_TOOLCHAIN_ROOT/android-sdk"}
export ANDROID_USER_HOME=${ANDROID_USER_HOME:-"$ROBOT_BUNNY_TOOLCHAIN_ROOT/android-user"}
export GRADLE_USER_HOME=${GRADLE_USER_HOME:-"$ROBOT_BUNNY_TOOLCHAIN_ROOT/gradle-cache"}
if [ "$#" -eq 0 ]; then set -- :app:assembleDebug :app:bundleRelease :app:lintRelease; fi
exec "$SCRIPT_DIR/../Android/gradlew" -p "$SCRIPT_DIR/../Android" --no-daemon "$@"
