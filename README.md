# moh-common-lib-angular

Shared Angular component library for BC Ministry of Health applications. Provides
reusable standalone components, services, models, and helpers consumed by apps such
as `fpcare`.

Packaged with ng-packagr into Angular Package Format output, with a secondary entry
point at `moh-common-lib-angular/captcha`. The workspace root stays
`private: true`; the thing that gets published is the built package in
`dist/moh-common-lib-angular`. Published to npm as
[moh-common-lib-angular](https://www.npmjs.com/package/moh-common-lib-angular). See
Packaging and release below.

---

## Stack

| Layer | Choice | Version |
|---|---|---|
| Runtime | Node.js | 22 LTS (pinned in `.nvmrc`, declared in `engines`) |
| Package manager | npm | 10.9+ (lockfile v3) |
| Framework | Angular | 19.2 (standalone components) |
| Language | TypeScript | 5.7, `strict: true`, target ES2022 |
| Build | `@angular-devkit/build-angular:application` | 19.2 |
| Tests | Jest via `@angular-builders/jest` | Jest 30, jsdom, no browser |
| Lint | ESLint flat config + angular-eslint | ESLint 9 |
| Format | Prettier, enforced on commit by Husky 9 + lint-staged | Prettier 3.7 |
| Styles | Sass (`.scss`), Bootstrap 5 tokens | see Styling below |
| Component docs | Storybook, `@storybook/angular` webpack framework | 10.6 |

Run `nvm use` in the repo root to pick up the pinned Node version.

---

## Architecture

### This repo has two roles

1. **A library.** `src/lib/` and `src/helpers/`, packaged by ng-packagr through the
   library project in `projects/common-lib/`. Consumers get compiled Angular Package
   Format output, not raw TypeScript.
2. **A showcase app.** `src/app/` is a runnable Angular application
   (`ng serve`) that renders library components for manual inspection.

`src/public-api.ts` is a hand-maintained barrel file, and it is the single source of
truth for what is public. A component that is not exported there is not part of the
library surface, even if the file exists.

The library project directory holds only configuration. The sources stay in `src/`, and
`projects/common-lib/ng-package.json` reaches back to them with a relative `entryFile`.

### Layout

```
projects/
  common-lib/          Library packaging config only, no source.
    package.json       The PUBLISHED manifest: name, version, peerDependencies.
    ng-package.json    ng-packagr config. entryFile points at ../../src/public-api.ts.
    tsconfig.lib.json  Library compile. Partial Ivy mode. Excludes src/app and specs.
src/
  public-api.ts        Export barrel. The public surface. Edit this to publish anything.
  main.ts, index.html  Showcase app entry point.
  styles.scss          Global stylesheet placeholder (see Styling caveat below).
  app/                 Showcase app only. Not shipped as library surface.
  helpers/             deburr, scroll, error type. Plus test-helpers.ts, which is
                       test-only and does import @angular/core/testing.
  lib/
    components/        One directory per component.
    models/            Data models and the abstract form base classes.
    services/          HTTP, logging, navigation guards, page state.
    styles/            _tokens.scss (design tokens in use), variables.scss and
                       common-mixins.scss (both currently unused, see Styling)
```

### Component conventions

Most library components follow the same shape. Match it when adding a new one.

- **Standalone.** No component is declared in an NgModule. Each declares its own
  `imports` array. `SharedCoreModule` is an empty no-op kept only so older consumers
  that imported an NgModule keep compiling.
- **Selector prefix `common-`.** For example `common-phn`, `common-address`.
- **Form controls extend `AbstractFormControl`** (`src/lib/models/abstract-form-control.ts`).
  That base is `@Directive()`-decorated and supplies two inherited inputs, `disabled`
  and `errorMessage`, plus an **abstract `label`** that each subclass must declare
  itself with a component-specific default. It also implements the
  `ControlValueAccessor` plumbing and the `registerValidation()` helper that lets a
  control attach its own validator to its `NgControl`.
- **Composite components extend `Base`** (`src/lib/models/base.ts`), which supplies a
  uuid `objectId`. `AbstractFormControl` extends `Base` too, so both paths get it.
  Individual form controls use it to build a unique `labelforId`, for example
  `'city_' + this.objectId`.
- **Errors render through `ErrorContainerComponent`** (`common-error-container`). This
  is the shared inline-error primitive. It is also the element `scrollToError()` looks
  for, so a control that renders its own error markup instead will silently break
  scroll-to-first-error for the whole page.
- **Single-value form controls expose `value`** as a getter/setter pair with a matching
  `valueChange` output, so `[(value)]` banana-in-a-box binding works. Ten of the
  nineteen exported components do this. Composite and layout components do not, and
  `CheckboxComponent` uses `data` / `dataChange` for historical reasons rather than
  because it is a pattern worth copying.

### Adding a new component

1. `src/lib/components/<name>/` with `<name>.component.ts`, `.html`, and `.scss` if
   it needs styles.
2. Extend `AbstractFormControl` for a form control, or `Base` for anything composite.
   Take `disabled` and `errorMessage` from the base rather than redeclaring them.
   `label` is abstract, so you must declare it yourself with a default that suits the
   component, for example `@Input() label = 'City';`. Omitting it will not compile.
3. Selector `common-<name>`. Declare every dependency in the component's own `imports`
   array. Avoid `NO_ERRORS_SCHEMA`; it hides real template errors, and the places it
   is used in this repo are legacy, not a pattern to copy.
4. Render validation errors through `common-error-container`.
5. Add `<name>.component.spec.ts`. Every component in `src/lib/components/` has one.
   `src/helpers/test-helpers.ts` has the shared fixture builders
   (`createTestingModule`, `setInput`, `getDebugInlineError`). Assert against rendered
   DOM, not against a property you just set on the fixture, and drive form controls
   through a real event rather than by calling the handler.
6. **Export it from `src/public-api.ts`.** Skipping this is the usual reason a
   consuming app cannot see a new component.
7. Add it to the catalogue table below and, if useful, to the showcase in
   `src/app/app.component.html`.
8. Add `<name>.component.stories.ts` beside the component for Storybook.

---

## Catalogue

### Components (29 exported)

Address and location:

| Component | Selector | Purpose |
|---|---|---|
| `AddressComponent` | `common-address` | Composite address block: street lines, city, province, country, postal code |
| `AddressValidatorComponent` | `common-address-validator` | Debounced address typeahead against an external lookup service (currently non-functional) |
| `CityComponent` | `common-city` | City text input with character validation |
| `CountryComponent` | `common-country` | Country picker, `ng-select` dropdown or free text |
| `ProvinceComponent` | `common-province` | Province picker, `ng-select` dropdown or free text (currently non-functional: throws on select) |
| `StreetComponent` | `common-street` | Street input, optional BC Geocoder typeahead (currently non-functional) |

Identity:

| Component | Selector | Purpose |
|---|---|---|
| `NameComponent` | `common-name` | Single name field |
| `FullNameComponent` | `common-full-name` | First, middle, last name bound to a `Person` |
| `PhnComponent` | `common-phn` | Masked BC Personal Health Number with checksum validation (currently non-functional: value changes are not reported) |
| `SinComponent` | `common-sin` | Masked Social Insurance Number |

Contact:

| Component | Selector | Purpose |
|---|---|---|
| `EmailComponent` | `common-email` | Email input with pattern validation |
| `PhoneNumberComponent` | `common-phone-number` | Masked North American phone number |

Generic inputs:

| Component | Selector | Purpose |
|---|---|---|
| `CheckboxComponent` | `common-checkbox` | Single checkbox with label |
| `RadioComponent` | `common-radio` | Radio group driven by an `IRadioItems[]` list |
| `ButtonComponent` | `common-button` | Bootstrap-styled button, re-emits click as `btnClick` |

| `PostalCodeComponent` | `common-postal-code` | Masked Canadian postal code, optional BC-only check |

Layout and presentation:

| Component | Selector | Purpose |
|---|---|---|
| `ErrorContainerComponent` | `common-error-container` | Inline error primitive used by every form control |
| `HeaderComponent` | `common-header` | BC Gov header with logo and skip-to-content link |
| `AccordionCommonComponent` | `common-accordion` | Collapsible section wrapper (currently non-functional) |
| `PageFrameworkComponent` | `common-page-framework` | Page layout with main column and optional aside |
| `PageSectionComponent` | `common-page-section` | Section layout within a page |
| `CoreBreadcrumbComponent` | `common-core-breadcrumb` | Breadcrumb bar with left, center and right slots |
| `FormActionBarComponent` | `common-form-action-bar` | Sticky submit bar. Place it after `common-page-framework`, not inside |
| `WizardProgressBarComponent` | `common-wizard-progress-bar` | Multi-page progress bar, active step derived from the route |
| `ConfirmTemplateComponent` | `common-confirm-template` | Confirmation panel, icon driven by `ApiStatusCodes` |
| `SampleModalComponent` | `common-sample-modal` | Modal displaying labelled sample images |
| `ConsentModalComponent` | `common-consent-modal` | Information collection notice gated on an agree checkbox |

Upload:

| Component | Selector | Purpose |
|---|---|---|
| `FileUploaderComponent` | `common-file-uploader` | Drag-and-drop image and PDF upload. PDFs rasterise one image per page |
| `ThumbnailComponent` | `common-thumbnail` | Uploaded image with click-to-enlarge and remove |

### Components present but NOT exported

**Not exported means not shipped.** ng-packagr compiles only the import graph reachable
from `src/public-api.ts`, so anything the barrel does not reach is absent from the
published package entirely, not merely hidden behind a deep import path. These exist in
this repo and are usable if you build against the sources, but a consumer installing the
package cannot import them by any path.

| Component | Why |
|---|---|
| `PasswordComponent` (`common-password`) | Pulls in `zxcvbn`, which not every consuming app carries. To ship it, export it from `public-api.ts` and add `zxcvbn` as an optional peer dependency, the same way `pdfjs-dist` is handled for `FileUploaderComponent`. |

### Validator directives

All seven are exported, each paired with a bare `ValidatorFn` for reactive forms.

The selectors are **attribute** selectors, which matters under standalone: an
unmatched attribute raises no compile error, so a consumer who forgets to add the
directive class to their `imports` gets a control that silently validates nothing.
Import the class, not just the attribute.

| Directive | Selector | Validator function | Error key |
|---|---|---|---|
| `ValidateCityDirective` | `[commonValidateCity]` | `commonValidateCity` | `invalidChar` |
| `ValidateStreetDirective` | `[commonValidateStreet]` | `commonValidateStreet` | `invalidChar` |
| `ValidateRegionDirective` | `[commonValidateRegion]` | `commonValidateRegion` | `invalidChar` |
| `ValidatePostalcodeDirective` | `[commonValidatePostalcode]` | `commonValidatePostalcode(hasMask, bcOnly)` | `pattern`, `invalidChar`, `invalidBCPostal` |
| `ValidateBcPostalDirective` | `[commonValidateBcPostal]` | `commonValidateBcPostal` | `invalidBCPostal` (deprecated, use `commonValidatePostalcode`) |
| `ValidateNameDirective` | `[commonValidateName]` | `commonValidateName` | `invalidChar` (deprecated) |
| `DuplicateCheckDirective` | `[commonDuplicateCheck]` | `commonDuplicateCheck(dupList)` | `duplicate` |

### Secondary entry point: captcha

`moh-common-lib-angular/captcha` is packaged separately, so an app that never renders
a captcha does not pay for it. Configured by `projects/common-lib/captcha/ng-package.json`
with sources in `src/captcha/`.

| Export | Kind | Notes |
|---|---|---|
| `CaptchaComponent` | component | `common-captcha`. Image or audio challenge, emits a JWT through `onValidToken` |
| `CaptchaModule` | NgModule | Compatibility module for apps that import an NgModule. Imports and exports the standalone component and provides `CaptchaDataService` |
| `CaptchaDataService` | service | Fetch, verify and audio calls against the captcha API |
| `CAPTCHA_STATE` | enum | The six states the component moves through |

```ts
import { CaptchaModule } from 'moh-common-lib-angular/captcha';
```

### Services

| Service | Purpose |
|---|---|
| `AbstractHttpService` | Base class for HTTP API services. Supplies `get`/`post`, uuid generation, attachment upload. |
| `GeocoderService` | BC Geocoder address lookup, returns `GeoAddressResult[]` |
| `CommonLogger` / `CommonLogEvents` | Splunk-bound application logging |
| `PageStateService` | Tracks per-page completion for multi-page form flows |
| `ContainerService` | Observable bus between a page container and its action bar |
| `AbstractPageGuardService` | Contract an app implements to control wizard navigation |
| `DefaultPageGuardService` | Default implementation, reads `BYPASS_GUARDS` and `START_PAGE_URL` tokens |
| `LoadPageGuardService` | `CanActivate` guard enforcing sequential navigation |
| `PdfService` | Thin wrapper over `pdfjs-dist`, used internally by `FileUploaderComponent` for PDF uploads |
| `RouteGuardService` | Older guard, superseded by `LoadPageGuardService` (deprecated) |
| `AbstractPgCheckService` | Older guard contract (deprecated) |
| `CheckCompleteBaseService` | Older page-completion tracking (deprecated) |

New work should use `AbstractPageGuardService` plus `LoadPageGuardService` and
`PageStateService`. The three deprecated services are kept only for existing consumers.

### Models and helpers

| Export | Kind | Notes |
|---|---|---|
| `Base` | class | uuid `objectId`. Most components extend this. |
| `Address`, `Person` | class | Data models with `copy()` and validation helpers |
| `AbstractForm`, `AbstractBaseForm`, `AbstractReactForm` | class | Page-level form base classes |
| `AbstractFormControl` | class | Base for every form control component |
| `Container`, `WizardProgressItem` | class, type | Wizard container state |
| `CommonImage` and friends | class, enum | Image model with sizing and error codes |
| `SimpleDate`, `ErrorMessage` | interface | |
| `ApiStatusCodes` | enum | Selects the icon shown by `ConfirmTemplateComponent` |
| `GeoAddressResult` | interface | Result shape returned by `GeocoderService` |
| `FileUploaderMsg` | interface | Customizes the required-file error message on `FileUploaderComponent` |
| `LETTER`, `NUMBER`, `SPACE` | const | Input mask character constants |
| `deburr` | function | Strips diacritics |
| `scrollTo`, `scrollToError` | function | Scroll utilities. `scrollToError` targets `common-error-container` |
| `MoHCommonLibraryError` | class | Library error type |

---

## Development

### Prerequisites

- Node.js 22 LTS. Run `nvm use` to pick up `.nvmrc`.
- [yalc](https://github.com/wclr/yalc) for local publishing: `npm install -g yalc`

The Angular CLI is a devDependency, so `npx ng` works without a global install. If you
prefer a global CLI, pin it: `npm install -g @angular/cli@19`.

### Common commands

```bash
npm ci             # clean install from the lockfile
npm start          # ng serve, runs the showcase app
npm run build      # ng build, showcase app, output to dist/showcase/
npm run build:lib  # ng-packagr, library output to dist/moh-common-lib-angular/
npm run pack:lib   # build:lib, then npm pack, producing the publishable tarball
npm test           # ng test, Jest via @angular-builders/jest
npm run lint       # ng lint, ESLint flat config
npm run prettier   # format src/
npm run storybook       # ng run moh-common-lib-angular:storybook, dev server
npm run build-storybook # ng run moh-common-lib-angular:build-storybook, output to dist/storybook/
```

### Pre-commit hook

`.husky/pre-commit` runs `npx lint-staged`, which acts on staged files only:

- `src/**/*.{ts,html}` gets `prettier --write` then `eslint`
- `src/**/*.{js,scss}` gets `prettier --write`

Prettier rewrites are re-staged automatically, so formatting fixes land in the same
commit. ESLint runs after, and an **error** aborts the commit while a **warning** does
not. See the lint entry under Known gaps for why the three highest-volume rules are
warnings.

To see what the hook would do without committing:

```bash
npx lint-staged --diff
```

Bypassing it (`git commit --no-verify`) should be rare and deliberate.

### Tests

Jest runs in Node with jsdom. No browser or Chrome binary is needed.

```bash
npx jest src/lib/components/phn/phn.component.spec.ts   # one spec
npx jest --watch                                        # watch mode
npx jest --coverage                                     # coverage to coverage/
```

Coverage is collected from `src/lib/**/*.ts` and `src/captcha/**/*.ts`, excluding
specs, modules, models, interfaces, and constants. `src/helpers/` and `src/app/` are
excluded entirely. Overall coverage is around 73% of statements; the branch figure is
lower, and `src/lib/components/file-uploader/` is the weakest because its canvas and
FileReader paths cannot execute under jsdom.

Current state: 54 suites, 433 tests, all passing.

### Storybook

Stories live beside the component they document, as `<name>.component.stories.ts`,
both under `src/lib/components/` and for the `captcha` secondary entry point. Config
is in `.storybook/`.

```bash
npm run storybook       # dev server
npm run build-storybook # static build to dist/storybook/
```

Preview CSS (Bootstrap 5, Font Awesome) is wired through the `storybook` and
`build-storybook` targets' `styles` array in `angular.json` only. The library itself
still ships no CSS and expects the consuming app to supply Bootstrap and Font Awesome.
The showcase app's own `build` target has no `styles` array, so unlike Storybook it
currently loads neither. The a11y addon panel runs automated accessibility checks
against each story. Compodoc is disabled. PR validation builds Storybook; see
Automated validation and releases below.

### Packaging and release

```bash
npm run build:lib    # ng-packagr, to dist/moh-common-lib-angular/
npm run pack:lib     # the above, then npm pack, giving a .tgz to hand to a consumer
```

[projects/common-lib/package.json](projects/common-lib/package.json) carries the published
name, version, and peerDependencies. Set release versions with `npm run release:set-version
-- X.Y.Z`, not by editing only the library manifest. The existing script updates and
checks all four locations: [package.json](package.json), [package-lock.json](package-lock.json)
at both its top level and `packages[""].version`, and the library manifest. It does not
commit or tag. Publish the built tarball, never the workspace root (`private: true`).

The library compiles in **partial** Ivy mode (`compilationMode` in `tsconfig.lib.json`).
Full mode makes ng-packagr write a `prepublishOnly` guard that aborts any publish, so do
not remove that setting. `npm run build:lib` also copies `LICENSE` and the npm package's
own README, [projects/common-lib/README.md](projects/common-lib/README.md), into `dist`,
which ng-packagr cannot do itself because both sit outside its project root. This root
README stays the GitHub/contributor doc and is never copied into the package. Update the
Catalogue in both files when exports change.

The showcase app writes to `dist/showcase` rather than `dist/` so that the two builds do
not delete each other's output.

#### Automated validation and releases

- [PR validation](.github/workflows/validate.yml) targets PRs into `main`, including forks,
  and runs `npm ci`, non-watching CI tests, lint, `npm run build-storybook`, and
  `npm run pack:lib`. It has only `contents: read`, no publishing secrets, and no
  `pull_request_target` trigger.
- [Release](.github/workflows/release.yml) runs on pushes to `main` in
  `bcgov/moh-common-lib-angular`. It compares the library version at the push's `before`
  commit with the accepted push commit. An unchanged version skips all release work;
  merging these workflows while both versions remain `2.0.0` does **not** publish.
  A missing/zero baseline fails closed. There is no tag trigger.
- The same workflow also accepts a manual `workflow_dispatch` run, for recovery when a
  push-triggered run failed before npm publication. From Actions > Release > Run
  workflow, select `main` and enter the version already committed in
  `projects/common-lib/package.json`; a mismatched input or a non-`main` ref fails the
  run instead of releasing. That in-workflow `main` check is only a backstop: because a
  dispatched run executes the workflow file from whichever branch is selected, the
  control that actually prevents a release from another branch is the `npm`
  environment's deployment-branch rule, restricted to `main` in setup step 2 below. The
  dispatch route shares every later gate with the push route: strict `X.Y.Z` and
  four-location version checks, preflight, tests, lint, pack, and the `npm`
  environment's existing-tag/release/npm checks.
- Dispatch limits: it cannot recover a run that already published to npm but failed at
  the tag or GitHub Release step, because the existing npm version fails closed; create
  the tag and release by hand instead. It tags the current `main` head, so any commits
  merged after the version bump are included in that tag.
- A release must have a strict stable `X.Y.Z` version (no leading zeroes, prerelease, or
  build suffix), matching versions in all four locations, a new tag, and a completed
  exact `## X.Y.Z (YYYY-MM-DD)` section in [CHANGELOG.md](CHANGELOG.md). A `v` prefix in
  the heading is also accepted. Notes are that section, not generated commit summaries.
  The existing `release:preflight` runs before dependency installation against a clean
  checkout with full history and tags. Its Git fetch uses a step-scoped, read-only token
  header in process memory; checkout never persists credentials.
- The read-only preparation job repeats install, tests, lint, and pack at the immutable
  accepted commit, then uploads the tarball and notes. The separate `npm` environment
  job verifies their SHA-256 checksums and the tarball's identity, checks remote state
  again, and publishes **that tarball without rebuilding it**. Only this job has
  `id-token: write` and `contents: write`. It checks out no code, installs no project
  dependencies, and suppresses npm lifecycle scripts. No build job receives OIDC.
- npm publication uses the public registry, OIDC provenance, public access, and the
  stable `latest` dist-tag. Only after npm succeeds does the job create a new `vX.Y.Z`
  Git ref at the tested commit and a matching GitHub Release with the reviewed notes.
  It never moves or deletes an existing tag, including `v2.0.0`.
- Both workflows use the latest Node 22 patch (must remain >=22.14.0) and explicitly
  install npm 11.5.1 for trusted publishing. Repository engine ranges and dependency
  versions are unchanged. Official actions are pinned to verified immutable SHAs; no
  dependency/artifact build caches are restored. Lint errors block, while the existing
  warnings remain warnings.

#### Required human setup and first publication

These are follow-through instructions, **not authorization to commit, push, tag, publish,
or change GitHub/npm settings**. The npm account is `istevens_npm`. Trusted publishing
must be configured on an existing npm package, so the first publication was a separate,
authenticated human operation; step 4 records it.

1. In GitHub Settings, protect `main` with a branch rule/ruleset: require PRs, reviewed
   approvals (including version and changelog), dismiss stale approvals, require the
   `Install, test, lint, pack` check from `PR validation`, and require branches to be
   up to date. Block direct pushes, force pushes, deletion, and administrative bypass.
   This workflow trusts pushes to `main`; YAML alone cannot enforce PR-only merges.
   Do not enable merge queues without adding and validating `merge_group` support.
   Require trusted review for workflow changes. Protect release tags against update
   and deletion while permitting the repository Actions token to create new tags.
2. Enable GitHub Actions and allow the four SHA-pinned official actions used here:
   `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, and
   `actions/download-artifact`. Organization policy must permit the release job's
   explicit `contents: write` and `id-token: write`; the default can remain read-only.
   Create a GitHub environment named `npm`, restrict deployment branches to `main`,
   add required release reviewers, and prevent self-review/bypass where available.
   The workflow always names this environment; protection settings require human setup.
3. Merge the workflow PR through review when separately approved. With unchanged
   `2.0.0`, the release job skips. Do not create, move, or delete `v2.0.0` to trigger it.
4. Done. `moh-common-lib-angular@2.0.0` was published manually by `istevens_npm` on
   2026-09-14, built from tag `v2.0.0` (`cb06ab47043d8f63d57a5a23b3953066df951fa8`) on
   Node 22. Registry `dist.shasum` is `82bbc0f0d82ce56099468c072421233cb445622e`. This
   bootstrap did not use Actions OIDC, so 2.0.0 carries no npm provenance. Tag `v2.0.0`
   and its GitHub Release already existed and were left unchanged.
5. Sign in to npmjs.com as `istevens_npm`. Open package `moh-common-lib-angular`,
   Settings, Trusted publishing, Add trusted publisher, GitHub Actions. Enter these
   case-sensitive values:

   | Setting | Value |
   |---|---|
   | Organization or user | `bcgov` (not the npm account) |
   | Repository | `moh-common-lib-angular` |
   | Workflow filename | `release.yml` (filename only) |
   | Environment name | `npm` |
   | Allowed actions | Explicitly allow direct `npm publish`, not stage-only |

   No `NPM_TOKEN` or `NODE_AUTH_TOKEN` secret is needed. After verifying trusted
   publishing, select npm Publishing access: **Require two-factor authentication and
   disallow tokens**. Keep human 2FA recovery available. npm does not validate these
   trust settings when saved; only a future approved release can verify OIDC end to end.

#### Future release PRs

Choose the next stable version based on consumer impact, then use the existing tooling
on the release PR branch. For example, only if review determines a patch is appropriate:

```bash
npm run release:set-version -- 2.0.1
npm run release:notes -- 2.0.1 v2.0.0
```

The notes command prints a draft; insert it into [CHANGELOG.md](CHANGELOG.md), replace
every TODO, remove generator comments, and review the summary and consumer actions.
Review all four version locations in the PR. Commit/push only with separate approval.
Do not pre-create the tag or manually publish: the accepted `main` push performs the
release after validation and environment approval. Ordinary PRs leave the version alone.

#### Serialization and manual recovery

Release concurrency never cancels an active run, including a publish awaiting approval.
GitHub concurrency retains **one pending run**, replaces older pending runs, and does not
guarantee ordering. An ordinary unchanged-version push can replace a pending release
push. Merge no additional PRs while a release is queued/running; confirm each release
completes before merging the next. A displaced release is not automatically replayed:
use its original Actions run's **Re-run all jobs** if available, after checking remote
state and coordinating all releases. Otherwise use the manual `workflow_dispatch` run
described above, or stop for an approved recovery plan; an empty push will not trigger
publication of an unchanged version.

Reruns fail closed if the target npm version, tag, or GitHub Release already exists,
even if it looks correct. They also block registry/network ambiguity and prevent an
older version from replacing a newer stable `latest`. There is no automatic republish,
tag repair, rollback, or "already exists, therefore success" shortcut.

- Before npm publication: fix the cause, confirm no version/tag/release exists, and
  rerun. Failed-job reruns reuse the uploaded artifact; all-job reruns validate and pack
  the same event commit again. Expired/missing artifacts block publishing (retention is
  30 days). Do not substitute a locally rebuilt artifact in a failed-job rerun.
- If npm may have succeeded: stop and inspect the original run's artifact, checksums,
  accepted commit, registry `dist.integrity`, and npm provenance. Compute the retained
  tarball's SHA-512 SRI, for example with `node -e 'const fs=require("node:fs"),
  crypto=require("node:crypto"); console.log("sha512-"+crypto.createHash("sha512").update(fs.readFileSync(process.argv[1])).digest("base64"))'
  /absolute/path/to/package.tgz`, and compare it with `npm view
  moh-common-lib-angular@X.Y.Z dist.integrity --registry=https://registry.npmjs.org`.
  Verify any existing tag resolves to the original tested commit and compare any Release
  notes to the retained notes. Any mismatch or missing evidence blocks recovery.
- Only after those checks and explicit approval may a maintainer create a **missing**
  tag at that exact commit and/or a **missing** GitHub Release from the exact reviewed
  notes. Never republish the version or move/delete an existing tag. If evidence cannot
  be verified, hand off for a new reviewed version rather than guessing or unpublishing.

### Local publishing (yalc)

Serve the built package, not the sources.

```bash
npm run build:lib
cd dist/moh-common-lib-angular && yalc publish

yalc add moh-common-lib-angular   # in the consuming app

npm run build:lib                 # after each library change
cd dist/moh-common-lib-angular && yalc push
```

Prefer yalc over `npm link`. `npm link` symlinks, which gives Angular two copies of
`@angular/core` and produces `NG0203` injection errors. yalc copies.

### Styling

Design tokens live in `src/lib/styles/_tokens.scss` and are consumed with
`@use '../../styles/tokens' as vars;`. That file holds only tokens with a call site;
extract another from `variables.scss` when a component needs it.

`src/lib/styles/variables.scss` is the older token file and **cannot be loaded**:
Bootstrap 5's `_variables.scss` calls `_assert-ascending`, which is namespaced rather
than global under `@use`, so any component importing it fails with `Undefined mixin`.
Nothing imports it, which is why this went unnoticed. `common-mixins.scss` is valid but
unused. Neither is wired into the build, and `angular.json` has no `styles` array, so
`src/styles.scss` is not part of it either. Component templates use Bootstrap 5 utility classes and Font
Awesome icon classes that this repo does not bundle. The consuming application supplies
them. A new component should assume the same and rely on Bootstrap classes rather than
importing `variables.scss`, until the styling pipeline is reconnected.

---

## Known gaps

Recorded so they are not rediscovered as surprises.

- **Four runtime dependencies are declared in the root `devDependencies`:** `ngx-mask`,
  `date-fns`, `uuid`, and `zxcvbn`. `uuid` backs `Base`, which nearly every component
  extends. For the first three this is cosmetic for consumers, because they are declared
  as `peerDependencies` in `projects/common-lib/package.json` and npm installs them; the
  root manifest simply misfiles them.

  `zxcvbn` is different: its only importer is `PasswordComponent`, which the barrel does
  not export, so it is not in the shipped bundle and is **not** a peer dependency. Adding
  it to the peer set would make every consumer install a package no shipped code uses.
  Exporting `PasswordComponent` later means adding `zxcvbn` back as a peer in the same
  change. The peer set is verifiable: every `from '<package>'` in
  `dist/moh-common-lib-angular/fesm2022/*.mjs` should have a matching peer entry, and
  nothing else should.

  `pdfjs-dist` is declared as an **optional** peer dependency, used only by
  `FileUploaderComponent` for PDF uploads. `PdfService` loads it through a dynamic
  `import()` with a `.catch()` attached. The `.catch()` is what keeps it optional: a
  bundler resolves a bare dynamic-import specifier at build time, so without it an app
  that never uploads a PDF still fails to build. Do not remove it.
- **`npm run lint` reports 538 problems: 0 errors and 538 warnings.** ESLint had never
  actually run in this repo before the Node 22 work added the missing `eslint`
  dependency, so the bulk of these are long-standing findings rather than regressions.
  None is auto-fixable. The count grew from 411 at the 2.0.0 release as ported
  components and their specs landed; the rule mix did not change.

  | Rule | Count |
  |---|---|
  | `@typescript-eslint/no-explicit-any` | 189 |
  | `@typescript-eslint/member-ordering` | 172 |
  | `no-underscore-dangle` | 119 |
  | `@typescript-eslint/no-unused-vars` | 48 |
  | `@angular-eslint/no-output-native` | 10 |

  These rules are set to `warn` rather than `error` on purpose, so that the pre-commit
  hook can block genuinely new problems without rejecting every commit that touches an
  already-affected file. The first three are high-volume style debt, `no-underscore-dangle`
  being the `ControlValueAccessor` idiom. `no-output-native` flags public `blur` and
  `select` outputs on eight components; renaming those breaks every consuming app's
  template bindings, so it needs an API decision rather than a drive-by fix. Promote each
  back to `error` in `eslint.config.js` as it is cleared.

  The 2 blocking `templateAccessibility` errors recorded here previously are gone. They
  covered a click handler in `password.component.html` with no keyboard equivalent, fixed
  by replacing the `span` with a real `button` in the validation-hardening work.
- **`npm audit`: 8 high-severity advisories in production dependencies**
  (`@angular/*`, `@ng-select/ng-select`), 33 total including dev. Clearing the Angular
  ones requires an Angular 20 upgrade.
- **`AccordionCommonComponent` still references removed ngx-bootstrap markup.** It emits
  `<accordion>`, an unknown element, and compiles only because of its
  `NO_ERRORS_SCHEMA`, so the panel never collapses and `[isOpen]` is inert. Either
  implement the toggle in plain markup, the way `thumbnail`, `sample-modal` and
  `consent-modal` were, or withdraw it from the barrel. `SampleModalComponent` was on
  this list for the same reason and is fixed: it now drives a plain-markup dialog from
  an `isOpen` flag.
- **Four components are broken on `main` and are not fixed here.** `common-phn` is
  missing both its `(ngModelChange)` and `(blur)` bindings, so it never reports a value
  and never shows an error. `common-province` throws on dropdown select, because
  `ng-select` emits a value where the handler reads `event.target.value`.
  `common-street` renders a label with its input commented out. `common-address-validator`
  never calls the geocoder, its typeahead bindings having been commented out with the
  ngx-bootstrap removal. All four are rendered by consuming apps.
- **`[errorMessage]` is documented on every form control and tested on none.**
  `CountryComponent` also handles it differently from its siblings: it prepends the
  label in its template instead of substituting `{label}`, so an override written the
  documented way renders a literal `{label}` on that component only.
- **The Jest transform is driven by a preset that does not declare support for the
  installed Jest.** `@angular-builders/jest@19.0.1` pins `jest-preset-angular@14.5.4`
  exactly, and that copy peer-requires `jest ^29` while the repo runs Jest 30. An
  `overrides` entry forces the resolution. All 433 tests pass, but nothing guards this
  combination; it clears on an `@angular-builders/jest` major that supports Jest 30.
  Note this is separate from the root `jest-preset-angular@16.2.0` that
  `setup-jest.ts` imports. The two-version split predates the Node 22 work.
- **2.0.0 has no npm provenance.** It was published manually to bootstrap the package.
  Releases from the workflow carry provenance once trusted publishing is configured
  (step 5 of the human setup above).

---

## Compatibility shim

`SharedCoreModule` is exported as an empty `NgModule` so apps that previously imported
the old library module keep compiling. It declares and exports nothing. Migrate to
importing individual standalone components directly.
