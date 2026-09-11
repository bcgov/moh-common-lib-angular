#!/usr/bin/env bash
# Release preflight for moh-common-lib-angular.
#
# Read-only. Exits non-zero on the first condition that would cause a version
# clash or ship an unfinished release description. Run it on the release commit,
# after the version bump and CHANGELOG entry are committed and before the tag is
# applied; it requires a clean working tree.
#
# Usage: ./build_utils/release-preflight.sh 1.1.0
set -euo pipefail

VERSION="${1:-}"
PKG_NAME="moh-common-lib-angular"
LIB_MANIFEST="projects/common-lib/package.json"
ROOT_MANIFEST="package.json"
TAG="v${VERSION}"

fail() { printf 'BLOCKED: %s\n' "$*" >&2; exit 1; }
ok()   { printf '  ok   %s\n' "$*"; }

[ -n "$VERSION" ] || fail "usage: release-preflight.sh X.Y.Z"

printf 'Preflight for %s@%s\n' "$PKG_NAME" "$VERSION"

# 1. Version string shape.
if ! printf '%s' "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.]+)?$'; then
  fail "'$VERSION' is not X.Y.Z or X.Y.Z-prerelease"
fi
ok "version string is well formed"

# 2. Run from the repo root.
[ -f "$LIB_MANIFEST" ] || fail "run this from the repo root; $LIB_MANIFEST not found"
ok "running from the repo root"

# 3. Clean working tree. A dirty tree means the tag would not describe what was tested.
if [ -n "$(git status --porcelain)" ]; then
  fail "working tree is not clean; commit or stash first"
fi
ok "working tree is clean"

# 4. Refresh remote refs, so the remote checks below are not stale.
git fetch --tags --quiet origin
ok "fetched tags from origin"

# 5. Local tag must not exist.
if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null 2>&1; then
  fail "local tag ${TAG} already exists"
fi
ok "no local tag ${TAG}"

# 6. Remote tag must not exist. This is the check that prevents two people
#    releasing the same number from different machines.
if git ls-remote --exit-code --tags origin "refs/tags/${TAG}" >/dev/null 2>&1; then
  fail "tag ${TAG} already exists on origin"
fi
ok "no tag ${TAG} on origin"

# 7. Must be strictly greater than the highest existing tag.
LAST_TAG="$(git tag -l 'v*' --sort=-v:refname | head -1)"
if [ -n "$LAST_TAG" ]; then
  LAST_VERSION="${LAST_TAG#v}"
  if [ "$VERSION" = "$LAST_VERSION" ]; then
    fail "${VERSION} is the current released version (${LAST_TAG})"
  fi
  HIGHER="$(printf '%s\n%s\n' "$LAST_VERSION" "$VERSION" | sort -V | tail -1)"
  if [ "$HIGHER" != "$VERSION" ]; then
    fail "${VERSION} is lower than the last tag ${LAST_TAG}"
  fi
  ok "${VERSION} is greater than the last tag ${LAST_TAG}"
else
  ok "no existing tags"
fi

# 8. Registry must not already carry this version. Publishing is irreversible,
#    so this is checked even when the release is tag-only.
#
#    npm view exits non-zero both when the version does not exist and when the
#    registry cannot be reached. Collapsing those two into "safe to proceed"
#    would make the only irreversible check fail open on a network blip, so the
#    two are told apart by the E404 code npm puts on stderr. Anything else is a
#    check that did not run, and an unrun check blocks.
NPM_VIEW_STDERR="$(mktemp)"
trap 'rm -f "$NPM_VIEW_STDERR"' EXIT
if REMOTE_VERSION="$(npm view "${PKG_NAME}@${VERSION}" version 2>"$NPM_VIEW_STDERR")"; then
  if [ -n "$REMOTE_VERSION" ]; then
    fail "${PKG_NAME}@${VERSION} is already published to the registry"
  fi
  fail "npm view returned success but no version; cannot confirm ${VERSION} is unpublished"
elif grep -q 'code E404' "$NPM_VIEW_STDERR"; then
  : # 404 is the answer we want: neither the package nor the version is there.
else
  printf '%s\n' "$(sed -n '1,3p' "$NPM_VIEW_STDERR")" >&2
  fail "cannot reach the registry to check whether ${VERSION} is published; see above"
fi
ok "${VERSION} is not on the registry"

# 9. The manifests must already carry the version being released.
ROOT_VERSION="$(node -p "require('./${ROOT_MANIFEST}').version")"
LIB_VERSION="$(node -p "require('./${LIB_MANIFEST}').version")"
[ "$ROOT_VERSION" = "$VERSION" ] \
  || fail "${ROOT_MANIFEST} says ${ROOT_VERSION}, expected ${VERSION}; run release-set-version.sh"
[ "$LIB_VERSION" = "$VERSION" ] \
  || fail "${LIB_MANIFEST} says ${LIB_VERSION}, expected ${VERSION}; run release-set-version.sh"
ok "both manifests say ${VERSION}"

# 10. There must be something to release.
if [ -n "$LAST_TAG" ]; then
  COMMIT_COUNT="$(git rev-list "${LAST_TAG}..HEAD" --no-merges --count)"
  [ "$COMMIT_COUNT" -gt 0 ] || fail "no commits since ${LAST_TAG}; nothing to release"
  ok "${COMMIT_COUNT} commit(s) since ${LAST_TAG}"
fi

# 11. The changelog must carry a finished section for this exact version.
[ -f CHANGELOG.md ] || fail "CHANGELOG.md does not exist; write the release notes first"
node -e '
  const fs = require("fs");
  const version = process.argv[1];
  const lines = fs.readFileSync("CHANGELOG.md", "utf8").split("\n");
  const start = lines.findIndex(l => new RegExp(`^## v?${version.replace(/\./g, "\\.")}\\b`).test(l));
  if (start === -1) {
    console.error(`BLOCKED: CHANGELOG.md has no "## ${version}" section`);
    process.exit(1);
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(l => /^## /.test(l));
  const section = (end === -1 ? rest : rest.slice(0, end)).join("\n");

  const problems = [];
  if (/TODO/.test(section)) problems.push("still contains TODO");
  if (/<!--/.test(section)) problems.push("still contains the generator comment block");
  if (!/^### Consumer action required$/m.test(section)) {
    problems.push("has no \"Consumer action required\" heading");
  }
  const summary = section.split(/^### /m)[0].trim();
  if (summary.length < 20) problems.push("has no summary paragraph above the first heading");

  if (problems.length) {
    console.error(`BLOCKED: CHANGELOG.md section for ${version} ${problems.join("; ")}`);
    process.exit(1);
  }
' "$VERSION"
ok "CHANGELOG.md section for ${VERSION} is complete"

printf '\nPreflight passed. Safe to tag %s.\n' "$TAG"
