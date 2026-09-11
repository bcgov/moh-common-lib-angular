## 2.0.0 (2026-09-11)

The library is now distributed as a compiled ng-packagr package instead of raw
TypeScript, and three validation defects were fixed in a way that rejects input the
previous release accepted. **Upgrading can make an existing form invalid at runtime with
no compile error**, so read the Breaking section before taking this version.

### Breaking

Each of these is a real defect being fixed. They are listed as breaking because a
consuming app that passed validation on 1.0.0 can fail it on 2.0.0, and nothing in the
build will warn you.

- **`EmailComponent` rejects malformed addresses it used to accept.** The old pattern
  `^(\S+)@(\S+)\.(\S+)$` let `\S` match `@` and `.`, so the three groups competed for the
  same characters. Addresses with more than one `@`, a trailing dot, or consecutive dots
  in the domain all passed. They now report `invalidEmail`. The rewrite also makes
  matching linear rather than quadratic: 4000 `@` pairs took 27ms before.
- **`FullNameComponent` enforces `required` for the first time.** The component holds a
  `Person`, and an object is always truthy, so Angular's `RequiredValidator` on the host
  passed regardless of what was filled in. The component now provides `NG_VALIDATORS` and
  reports `{ required: true }` when the last name is blank or whitespace. A form holding a
  full name with a blank last name is now invalid where it was previously valid.
- **`NameComponent` enforces initials validation for the first time.** The unanchored
  `[a-zA-Z]*$` matched the empty string at the end of any input, so every value passed and
  the `invalidChar` error was unreachable. It is now anchored and applies.

### Added

- **Angular Package Format output, built by ng-packagr.** `npm run build:lib` produces the
  package in `dist/moh-common-lib-angular`; `npm run pack:lib` produces the tarball.
  Consumers get compiled output with `.d.ts` files instead of raw TypeScript compiled by
  their own build.
- **Declared `peerDependencies`.** `ngx-mask`, `date-fns`, `uuid`, and `zxcvbn` are
  imported by shipped code but were only ever listed in the root `devDependencies`, so
  every consumer had to discover them. npm now installs them.
- **Apache 2.0 `LICENSE`**, included in the published package.
- **Release tooling in `build_utils/`.** `release-set-version.sh` writes the version to all
  four places it lives, `release-notes.sh` drafts the changelog from the commit range, and
  `release-preflight.sh` blocks a release on a tag or registry collision, a version that
  does not move forward, manifests that disagree, or an unfinished changelog entry.

### Fixed

- `FullNameComponent` never called `_onChange` or `_onTouched`, so the host control stayed
  pristine and never revalidated. Values only appeared to propagate because the two-way
  `person` binding mutated the same object the control held. `personChange` was declared
  but never emitted; it now fires.
- The password show/hide control was a `span` with a click handler: not focusable, not
  keyboard-operable, unnamed for screen readers. It is now a `button` with a
  state-dependent `aria-label`, styled to look unchanged.
- The name and email patterns are hoisted to module constants instead of being recompiled
  on every validation cycle.

### Changed

- **Node 22 LTS is required**, pinned in `.nvmrc` and declared in `engines`. Node 20
  reached end of life on 2026-04-30. The dependency tree already needed Node >= 20.17; the
  requirement was simply never recorded.
- The showcase app builds to `dist/showcase` instead of `dist/`. It was deleting its output
  path first, which wiped the library artifact whenever the app built after the library.
- Root `package.json` no longer sets `main` or `typings`. The published manifest is
  `projects/common-lib/package.json`, and ng-packagr generates its own entries.
- Toolchain repair: the repo could not `npm ci` on any Node version, because `jest@^29.7.0`
  conflicted with `jest-preset-angular@16.1.4`. ESLint was not a dependency at all, so
  `npm run lint` had never run; it is now on flat config and reports 411 pre-existing
  warnings and 0 errors. `lint-staged` ran a glob that required two dots in a filename and
  silently skipped every single-word file.

### Consumer action required

- **Check any form using `common-full-name` for a blank last name.** That form is now
  invalid. This is the change most likely to be noticed by an end user rather than a
  developer.
- **Check stored or seeded email addresses against the tighter pattern**, specifically
  multiple `@`, a trailing dot, or consecutive dots in the domain.
- **Move to Node 22** if you are not there already.
- If you were consuming raw TypeScript through yalc, re-link against
  `dist/moh-common-lib-angular` rather than the repo root.
- Nothing else. No export was removed or renamed, and no selector, input, or output
  changed, so no import or template needs editing.

### Not in the published package

`ng-packagr` compiles only what `src/public-api.ts` reaches, so `PasswordComponent`,
`ConfirmTemplateComponent`, and the four validator directives (`ValidateCityDirective`,
`ValidateStreetDirective`, `ValidateNameDirective`, `DuplicateCheckDirective`) are absent
from the package entirely. Earlier documentation said they could be reached by deep import
path; that has never worked against a packaged build. Export them from the barrel to ship
them.
