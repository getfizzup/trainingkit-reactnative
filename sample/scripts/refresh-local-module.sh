#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
SAMPLE_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
REPO_DIR="$(CDPATH= cd -- "$SAMPLE_DIR/.." && pwd)"
ANDROID_DIR="$SAMPLE_DIR/android"
LOCAL_MODULE_DIR="$SAMPLE_DIR/node_modules/trainingkit-reactnative"

echo "Refreshing local trainingkit-reactnative link..."
rm -rf "$LOCAL_MODULE_DIR"
ln -s "$REPO_DIR" "$LOCAL_MODULE_DIR"

echo "Regenerating Android autolinking and manifest state..."
(cd "$ANDROID_DIR" && ./gradlew :app:processDebugManifest --rerun-tasks)

echo "Rebuilding and installing sample app..."
(cd "$ANDROID_DIR" && ./gradlew :app:installDebug --rerun-tasks)
