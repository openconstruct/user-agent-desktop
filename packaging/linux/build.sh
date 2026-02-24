#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GECKO_DIR="$(readlink -f "$ROOT_DIR/mozilla-release")"
PKG_NAME="${PKG_NAME:-umbra-browser}"
RELEASE="${RELEASE:-1}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/packaging/out}"
WORK_DIR="$OUT_DIR/work"
BUILD_RPM="${BUILD_RPM:-1}"
BUILD_DEB="${BUILD_DEB:-1}"

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
    ARCH_RPM="x86_64"
    ARCH_DEB="amd64"
    ;;
  aarch64)
    ARCH_RPM="aarch64"
    ARCH_DEB="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH_RAW"
    echo "Set ARCH_RAW to x86_64 or aarch64."
    exit 1
    ;;
esac

echo "Using:"
echo "  ROOT_DIR=$ROOT_DIR"
echo "  OBJ_DIR=$OBJ_DIR"
echo "  APP_DIR=$APP_DIR"
echo "  VERSION=$VERSION"
echo "  RELEASE=$RELEASE"
echo "  ARCH_RPM=$ARCH_RPM"
echo "  ARCH_DEB=$ARCH_DEB"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$OUT_DIR"

STAGE_DIR="$WORK_DIR/stage"
mkdir -p \
  "$STAGE_DIR/usr/lib" \
  "$STAGE_DIR/usr/bin" \
  "$STAGE_DIR/usr/share/applications" \
  "$STAGE_DIR/usr/share/licenses/$PKG_NAME"

cp -R "$APP_DIR" "$STAGE_DIR/usr/lib/umbra"
ln -s ../lib/umbra/umbra "$STAGE_DIR/usr/bin/umbra"
install -m 0644 "$ROOT_DIR/packaging/linux/umbra.desktop" "$STAGE_DIR/usr/share/applications/umbra.desktop"
install -m 0644 "$ROOT_DIR/LICENSE" "$STAGE_DIR/usr/share/licenses/$PKG_NAME/LICENSE"

for size in 48 64 128 256; do
  icon_src="$ROOT_DIR/brands/Umbra/branding/default${size}.png"
  if [[ -f "$icon_src" ]]; then
    icon_dst="$STAGE_DIR/usr/share/icons/hicolor/${size}x${size}/apps"
    mkdir -p "$icon_dst"
    install -m 0644 "$icon_src" "$icon_dst/umbra.png"
  fi
done

desktop-file-validate "$STAGE_DIR/usr/share/applications/umbra.desktop"

if [[ "$BUILD_RPM" == "1" ]]; then
RPM_TOP="$WORK_DIR/rpmbuild"
mkdir -p "$RPM_TOP"/{BUILD,RPMS,SOURCES,SPECS,SRPMS,BUILDROOT}
RPM_TMP="$WORK_DIR/rpmtmp"
mkdir -p "$RPM_TMP"

RPM_SOURCE_ROOT="$WORK_DIR/${PKG_NAME}-${VERSION}"
mkdir -p "$RPM_SOURCE_ROOT"
cp -R "$STAGE_DIR"/. "$RPM_SOURCE_ROOT"/
tar -C "$WORK_DIR" -cJf "$RPM_TOP/SOURCES/${PKG_NAME}-${VERSION}.tar.xz" "${PKG_NAME}-${VERSION}"

cat > "$RPM_TOP/SPECS/${PKG_NAME}.spec" <<EOF
%global debug_package %{nil}
Name:           ${PKG_NAME}
Version:        ${VERSION}
Release:        ${RELEASE}%{?dist}
Summary:        Umbra privacy-focused web browser
License:        MPL-2.0
URL:            https://www.umbra.com/private-browser/
Source0:        %{name}-%{version}.tar.xz
BuildArch:      ${ARCH_RPM}
Requires:       alsa-lib
Requires:       dbus-libs
Requires:       gtk3
Requires:       libX11
Requires:       libXtst
Requires:       nss

%description
Umbra Browser is a privacy-focused desktop web browser based on Firefox.

%prep
%autosetup -n %{name}-%{version}

%build

%install
mkdir -p %{buildroot}
cp -R usr %{buildroot}/

%post
if [ -x /usr/bin/update-desktop-database ]; then
  /usr/bin/update-desktop-database -q /usr/share/applications || :
fi
if [ -x /usr/bin/gtk-update-icon-cache ]; then
  /usr/bin/gtk-update-icon-cache -q /usr/share/icons/hicolor || :
fi

%postun
if [ -x /usr/bin/update-desktop-database ]; then
  /usr/bin/update-desktop-database -q /usr/share/applications || :
fi
if [ -x /usr/bin/gtk-update-icon-cache ]; then
  /usr/bin/gtk-update-icon-cache -q /usr/share/icons/hicolor || :
fi

%files
%license /usr/share/licenses/%{name}/LICENSE
/usr/bin/umbra
/usr/lib/umbra
/usr/share/applications/umbra.desktop
/usr/share/icons/hicolor/*/apps/umbra.png

%changelog
* Tue Feb 24 2026 Umbra Team <support@umbrabrowser.com> - ${VERSION}-${RELEASE}
- Automated package build.
EOF

if ! rpmbuild \
  --define "_topdir $RPM_TOP" \
  --define "_tmppath $RPM_TMP" \
  -bb "$RPM_TOP/SPECS/${PKG_NAME}.spec"; then
  echo "rpmbuild failed with default post-processing; retrying with __os_install_post disabled."
  rpmbuild \
    --define "_topdir $RPM_TOP" \
    --define "_tmppath $RPM_TMP" \
    --define "__os_install_post %{nil}" \
    --define "__spec_install_post %{nil}" \
    -bb "$RPM_TOP/SPECS/${PKG_NAME}.spec"
fi
find "$RPM_TOP/RPMS" -type f -name '*.rpm' -exec cp -f {} "$OUT_DIR/" \;
fi

if [[ "$BUILD_DEB" == "1" ]]; then
DEB_ROOT="$WORK_DIR/debroot"
cp -R "$STAGE_DIR" "$DEB_ROOT"
mkdir -p "$DEB_ROOT/DEBIAN"

cat > "$DEB_ROOT/DEBIAN/control" <<EOF
Package: ${PKG_NAME}
Version: ${VERSION}-${RELEASE}
Section: web
Priority: optional
Architecture: ${ARCH_DEB}
Maintainer: Umbra Team <support@umbrabrowser.com>
Depends: libasound2, libdbus-1-3, libgtk-3-0, libnss3, libx11-6, libxtst6, libstdc++6, libc6
Homepage: https://www.umbra.com/private-browser/
Description: Umbra privacy-focused web browser
 Umbra Browser is a privacy-focused desktop web browser based on Firefox.
EOF

cat > "$DEB_ROOT/DEBIAN/postinst" <<'EOF'
#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database -q /usr/share/applications || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi
EOF

cat > "$DEB_ROOT/DEBIAN/postrm" <<'EOF'
#!/bin/sh
set -e
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database -q /usr/share/applications || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -q /usr/share/icons/hicolor || true
fi
EOF

chmod 0755 "$DEB_ROOT/DEBIAN/postinst" "$DEB_ROOT/DEBIAN/postrm"

(
  cd "$DEB_ROOT"
  find usr -type f -print0 | sort -z | xargs -0 md5sum > DEBIAN/md5sums
)

if ! dpkg-deb --root-owner-group --build "$DEB_ROOT" "$OUT_DIR/${PKG_NAME}_${VERSION}-${RELEASE}_${ARCH_DEB}.deb"; then
  echo "dpkg-deb --root-owner-group failed; retrying with fakeroot."
  fakeroot dpkg-deb --build "$DEB_ROOT" "$OUT_DIR/${PKG_NAME}_${VERSION}-${RELEASE}_${ARCH_DEB}.deb"
fi
fi

echo
echo "Packages written to: $OUT_DIR"
find "$OUT_DIR" -maxdepth 1 -type f \( -name '*.rpm' -o -name '*.deb' \) -print | sort
