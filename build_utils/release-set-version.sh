#!/usr/bin/env bash
# Set the release version in every place it lives, in one step.
#
# The version lives in FOUR places: package.json, package-lock.json (twice), and
# projects/common-lib/package.json. npm version writes the first three and knows
# nothing about the fourth, which is the one that ends up in the published
# tarball. Editing them by hand is how the tag and the artifact come to disagree.
#
# Usage: ./build_utils/release-set-version.sh 1.1.0
set -euo pipefail

VERSION="${1:-}"
LIB_MANIFEST="projects/common-lib/package.json"

fail() { printf 'BLOCKED: %s\n' "$*" >&2; exit 1; }

[ -n "$VERSION" ] || fail "usage: release-set-version.sh X.Y.Z"
printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.]+)?$' \
  || fail "'$VERSION' is not X.Y.Z or X.Y.Z-prerelease"
[ -f "$LIB_MANIFEST" ] || fail "run this from the repo root; $LIB_MANIFEST not found"

# Root package.json and package-lock.json. No tag, no commit; this script only
# edits files, so the changes can be reviewed before anything is committed.
npm version "$VERSION" --no-git-tag-version --allow-same-version >/dev/null

# The published manifest. npm version does not know about it.
node -e '
  const fs = require("fs");
  const path = process.argv[1];
  const version = process.argv[2];
  const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
  pkg.version = version;
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
' "$LIB_MANIFEST" "$VERSION"

# Read all four back. Never trust the write; prove it.
ROOT_VERSION="$(node -p 'require("./package.json").version')"
LOCK_VERSION="$(node -p 'require("./package-lock.json").version')"
LOCK_ROOT_VERSION="$(node -p 'require("./package-lock.json").packages[""].version')"
LIB_VERSION="$(node -p "require('./${LIB_MANIFEST}').version")"

printf 'package.json                       %s\n' "$ROOT_VERSION"
printf 'package-lock.json                  %s\n' "$LOCK_VERSION"
printf 'package-lock.json packages[""]     %s\n' "$LOCK_ROOT_VERSION"
printf '%-34s %s\n' "$LIB_MANIFEST" "$LIB_VERSION"

for got in "$ROOT_VERSION" "$LOCK_VERSION" "$LOCK_ROOT_VERSION" "$LIB_VERSION"; do
  [ "$got" = "$VERSION" ] || fail "version not applied everywhere; got '$got', wanted '$VERSION'"
done

printf '\nAll four locations set to %s.\n' "$VERSION"
