#!/usr/bin/env bash
# Generate the CHANGELOG skeleton for a release, grouped by Conventional Commit
# type. Output is a DRAFT: every TODO must be replaced by hand before
# release-preflight.sh will pass. Prints to stdout.
#
# Usage: ./build_utils/release-notes.sh 1.1.0 [since-ref]
set -euo pipefail

VERSION="${1:-}"
fail() { printf 'BLOCKED: %s\n' "$*" >&2; exit 1; }
[ -n "$VERSION" ] || fail "usage: release-notes.sh X.Y.Z [since-ref]"

SINCE="${2:-$(git tag -l 'v*' --sort=-v:refname | head -1)}"
RANGE="HEAD"
[ -n "$SINCE" ] && RANGE="${SINCE}..HEAD"

# Conventional Commit types that map to each consumer-facing heading.
section() {
  local pattern="$1"
  git log "$RANGE" --no-merges --pretty=format:'%h%x09%s' \
    | grep -E "$(printf '\t(%s)(\\([^)]*\\))?!?: ' "$pattern")" \
    | sed -E 's/^([0-9a-f]+)\t[a-z]+(\([^)]*\))?!?: (.*)$/- \3 (\1)/' \
    || true
}

# Anything marked breaking, by either convention: a "!" before the colon, or a
# "BREAKING CHANGE:" trailer in the commit body.
breaking() {
  {
    git log "$RANGE" --no-merges --pretty=format:'%h%x09%s' \
      | grep -E '\t[a-z]+(\([^)]*\))?!: ' \
      | sed -E 's/^([0-9a-f]+)\t[a-z]+(\([^)]*\))?!: (.*)$/- \3 (\1)/' || true
    git log "$RANGE" --no-merges --grep='BREAKING CHANGE' --pretty=format:'- %s (%h)' || true
  } | sort -u
}

emit() {
  local heading="$1" body="$2"
  printf '\n### %s\n\n' "$heading"
  if [ -n "$body" ]; then printf '%s\n' "$body"; else printf -- '- None.\n'; fi
}

COUNT="$(git rev-list "$RANGE" --no-merges --count)"
[ "$COUNT" -gt 0 ] || fail "no commits in range ${RANGE}; nothing to release"

printf '## %s (%s)\n\n' "$VERSION" "$(date +%Y-%m-%d)"
printf 'TODO one or two sentences for a developer who consumes this library and has\n'
printf 'never read this repo. Lead with anything that changes what they must do.\n'

emit "Breaking"  "$(breaking)"
emit "Added"     "$(section 'feat')"
emit "Fixed"     "$(section 'fix')"
emit "Changed"   "$(section 'perf|refactor|build|chore|a11y|style')"

printf '\n### Consumer action required\n\n'
printf -- '- TODO state the action, or write "Nothing." Do not delete this heading.\n'

printf '\n<!-- Commits in %s, for the author only. Delete this block before committing. -->\n' "$RANGE"
printf '<!--\n'
git log "$RANGE" --no-merges --pretty=format:'%h %s'
printf '\n-->\n'
