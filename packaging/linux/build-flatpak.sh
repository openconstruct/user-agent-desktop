#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GECKO_DIR="$(readlink -f "$ROOT_DIR/mozilla-release")"

APP_ID="${APP_ID:-org.umbra.Browser}"
RUNTIME="${RUNTIME:-org.freedesktop.Platform}"
SDK="${SDK:-org.freedesktop.Sdk}"
RUNTIME_BRANCH="${RUNTIME_BRANCH:-24.08}"
APP_BRANCH="${APP_BRANCH:-master}"

OUT_DIR="${OUT_DIR:-$ROOT_DIR/packaging/out/flatpak}"
WORK_DIR="$OUT_DIR/work"
BUILD_DIR="$WORK_DIR/build-dir"
REPO_DIR="$OUT_DIR/repo"
MANIFEST="$WORK_DIR/${APP_ID}.json"

detect_obj_dir() {
  local candidate
  while IFS= read -r candidate; do
    if [[ -d "$candidate/dist/umbra" ]]; then
      echo "$candidate"
      return 0
    fi
  done < <(find "$GECKO_DIR" -maxdepth 1 -type d -name 'obj-*-linux-gnu' | sort)
  return 1
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd"
    exit 1
  fi
}

check_runtime_installed() {
  if ! flatpak info "${RUNTIME}//${RUNTIME_BRANCH}" >/dev/null 2>&1; then
    echo "Missing Flatpak runtime: ${RUNTIME}//${RUNTIME_BRANCH}"
    echo "Install with:"
    echo "  flatpak install -y flathub ${RUNTIME}//${RUNTIME_BRANCH}"
    exit 1
  fi

  if ! flatpak info "${SDK}//${RUNTIME_BRANCH}" >/dev/null 2>&1; then
    echo "Missing Flatpak SDK: ${SDK}//${RUNTIME_BRANCH}"
    echo "Install with:"
    echo "  flatpak install -y flathub ${SDK}//${RUNTIME_BRANCH}"
    exit 1
  fi
}

OBJ_DIR="${OBJ_DIR:-}"
if [[ -z "$OBJ_DIR" ]]; then
  OBJ_DIR="$(detect_obj_dir || true)"
fi

if [[ -z "$OBJ_DIR" ]]; then
  echo "Could not find linux objdir under $ROOT_DIR/mozilla-release"
  echo "Set OBJ_DIR=/abs/path/to/obj-*-linux-gnu"
  exit 1
fi

APP_DIR="${APP_DIR:-$OBJ_DIR/dist/umbra}"
if [[ ! -d "$APP_DIR" ]]; then
  echo "Missing app directory: $APP_DIR"
  echo "Build first: MOZCONFIG=/path/to/mozconfig ./mach build && ./mach package"
  exit 1
fi

VERSION="${VERSION:-$(sed -n 's/^Version=//p' "$APP_DIR/application.ini" | head -n 1)}"
if [[ -z "$VERSION" ]]; then
  echo "Could not detect version from $APP_DIR/application.ini"
  exit 1
fi

ARCH_RAW="${ARCH_RAW:-$(uname -m)}"
case "$ARCH_RAW" in
  x86_64)
    FLATPAK_ARCH="x86_64"
    ;;
  aarch64)
    FLATPAK_ARCH="aarch64"
    ;;
  *)
    echo "Unsupported architecture for flatpak: $ARCH_RAW"
    echo "Set ARCH_RAW to x86_64 or aarch64."
    exit 1
    ;;
esac

require_cmd flatpak
require_cmd flatpak-builder
require_cmd desktop-file-validate
check_runtime_installed

echo "Using:"
echo "  ROOT_DIR=$ROOT_DIR"
echo "  OBJ_DIR=$OBJ_DIR"
echo "  APP_DIR=$APP_DIR"
echo "  VERSION=$VERSION"
echo "  APP_ID=$APP_ID"
echo "  APP_BRANCH=$APP_BRANCH"
echo "  RUNTIME=$RUNTIME//$RUNTIME_BRANCH"
echo "  SDK=$SDK//$RUNTIME_BRANCH"
echo "  ARCH=$FLATPAK_ARCH"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$OUT_DIR" "$REPO_DIR"

STAGE_DIR="$WORK_DIR/stage"
mkdir -p \
  "$STAGE_DIR/lib/umbra" \
  "$STAGE_DIR/bin" \
  "$STAGE_DIR/share/applications" \
  "$STAGE_DIR/share/metainfo"

cp -R "$APP_DIR"/. "$STAGE_DIR/lib/umbra/"

cat > "$STAGE_DIR/bin/umbra" <<'EOF'
#!/usr/bin/env bash
exec /app/lib/umbra/umbra "$@"
EOF
chmod 0755 "$STAGE_DIR/bin/umbra"

DESKTOP_SRC="$ROOT_DIR/packaging/linux/umbra.desktop"
DESKTOP_DST="$STAGE_DIR/share/applications/${APP_ID}.desktop"
cp "$DESKTOP_SRC" "$DESKTOP_DST"
sed -i "s/^Icon=.*/Icon=${APP_ID}/" "$DESKTOP_DST"
desktop-file-validate "$DESKTOP_DST"

cat > "$STAGE_DIR/share/metainfo/${APP_ID}.metainfo.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${APP_ID}</id>
  <name>Umbra Browser</name>
  <summary>Privacy-focused web browser</summary>
  <metadata_license>CC0-1.0</metadata_license>
  <project_license>MPL-2.0</project_license>
  <description>
    <p>Umbra Browser is a privacy-focused web browser based on Firefox ESR.</p>
  </description>
  <launchable type="desktop-id">${APP_ID}.desktop</launchable>
</component>
EOF

for size in 48 64 128 256; do
  icon_src="$ROOT_DIR/brands/Umbra/branding/default${size}.png"
  if [[ -f "$icon_src" ]]; then
    icon_dst="$STAGE_DIR/share/icons/hicolor/${size}x${size}/apps"
    mkdir -p "$icon_dst"
    install -m 0644 "$icon_src" "$icon_dst/${APP_ID}.png"
  fi
done

cat > "$MANIFEST" <<EOF
{
  "app-id": "${APP_ID}",
  "branch": "${APP_BRANCH}",
  "runtime": "${RUNTIME}",
  "runtime-version": "${RUNTIME_BRANCH}",
  "sdk": "${SDK}",
  "command": "umbra",
  "finish-args": [
    "--share=network",
    "--share=ipc",
    "--socket=wayland",
    "--socket=fallback-x11",
    "--socket=pulseaudio",
    "--device=dri",
    "--filesystem=xdg-download"
  ],
  "modules": [
    {
      "name": "umbra",
      "buildsystem": "simple",
      "build-commands": [
        "install -d /app/lib/umbra /app/bin /app/share/applications /app/share/icons",
        "cp -a . /app/"
      ],
      "sources": [
        {
          "type": "dir",
          "path": "stage"
        }
      ]
    }
  ]
}
EOF

flatpak-builder \
  --arch="$FLATPAK_ARCH" \
  --force-clean \
  --repo="$REPO_DIR" \
  "$BUILD_DIR" \
  "$MANIFEST"

BUNDLE_PATH="$OUT_DIR/${APP_ID}-${VERSION}-${FLATPAK_ARCH}.flatpak"
flatpak build-bundle \
  --arch="$FLATPAK_ARCH" \
  "$REPO_DIR" \
  "$BUNDLE_PATH" \
  "$APP_ID" \
  "$APP_BRANCH"

echo
echo "Flatpak outputs:"
echo "  Repo:   $REPO_DIR"
echo "  Bundle: $BUNDLE_PATH"
echo
echo "Install bundle locally:"
echo "  flatpak install -y --user $BUNDLE_PATH"
echo
echo "Run:"
echo "  flatpak run $APP_ID"
