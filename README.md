# moh-common-lib-angular

Shared Angular component library for BC Ministry of Health applications. Provides
reusable standalone components, services, models, and helpers consumed by apps such
as `fpcare`.

Packaged with ng-packagr into Angular Package Format output. The workspace root stays
`private: true`; the thing that gets published is the built package in
`dist/moh-common-lib-angular`. Not yet published to any registry. See Packaging and
release below.

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
    styles/            variables.scss (design tokens), common-mixins.scss
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
5. Add `<name>.component.spec.ts`. Every component in `src/lib/components/` has one
   except the dead `consent-modal`. `src/helpers/test-helpers.ts` has the shared
   fixture builders (`createTestingModule`, `setInput`, `getDebugInlineError`).
6. **Export it from `src/public-api.ts`.** Skipping this is the usual reason a
   consuming app cannot see a new component.
7. Add it to the catalogue table below and, if useful, to the showcase in
   `src/app/app.component.html`.

---

## Catalogue

### Components (19 exported)

Address and location:

| Component | Selector | Purpose |
|---|---|---|
| `AddressComponent` | `common-address` | Composite address block: street lines, city, province, country, postal code |
| `AddressValidatorComponent` | `common-address-validator` | Debounced address typeahead against an external lookup service |
| `CityComponent` | `common-city` | City text input with character validation |
| `CountryComponent` | `common-country` | Country picker, `ng-select` dropdown or free text |
| `ProvinceComponent` | `common-province` | Province picker, `ng-select` dropdown or free text |
| `StreetComponent` | `common-street` | Street input, optional BC Geocoder typeahead |

Identity:

| Component | Selector | Purpose |
|---|---|---|
| `NameComponent` | `common-name` | Single name field |
| `FullNameComponent` | `common-full-name` | First, middle, last name bound to a `Person` |
| `PhnComponent` | `common-phn` | Masked BC Personal Health Number with checksum validation |
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

Layout and presentation:

| Component | Selector | Purpose |
|---|---|---|
| `ErrorContainerComponent` | `common-error-container` | Inline error primitive used by every form control |
| `HeaderComponent` | `common-header` | BC Gov header with logo and skip-to-content link |
| `AccordionCommonComponent` | `common-accordion` | Collapsible section wrapper |
| `SampleModalComponent` | `common-sample-modal` | Modal displaying labelled sample images |

### Components present but NOT exported

| Component | Why |
|---|---|
| `PasswordComponent` (`common-password`) | Pulls in `zxcvbn`, which not every consuming app carries. Import by deep path if needed. |
| `ConfirmTemplateComponent` (`common-confirm-template`) | Never added to the barrel. |
| `ConsentModalComponent` | Entire class body is commented out. The template file is empty. Dead code. |

### Validator directives

Not exported from `public-api.ts`; import by deep path. Each also exports a bare
`ValidatorFn` for reactive forms.

| Directive | Selector | Error key |
|---|---|---|
| `ValidateCityDirective` | `[commonValidateCity]` | `invalidChar` |
| `ValidateStreetDirective` | `[commonValidateStreet]` | `invalidChar` |
| `ValidateNameDirective` | `[commonValidateName]` | `invalidChar` (deprecated) |
| `DuplicateCheckDirective` | `[commonDuplicateCheck]` | `duplicate` |

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

Coverage is collected from `src/lib/**/*.ts`, excluding specs, modules, models,
interfaces, and constants. `src/helpers/` and `src/app/` are excluded entirely.

Current state: 38 suites, 146 tests, all passing.

### Packaging and release

```bash
npm run build:lib    # ng-packagr, to dist/moh-common-lib-angular/
npm run pack:lib     # the above, then npm pack, giving a .tgz to hand to a consumer
```

`projects/common-lib/package.json` carries the published name, version, and
peerDependencies. Bump the version there, not in the root manifest, before each release.
Publishing runs from `dist/moh-common-lib-angular`, never from the repo root; the root is
`private: true` and will refuse.

The library compiles in **partial** Ivy mode (`compilationMode` in `tsconfig.lib.json`).
Full mode makes ng-packagr write a `prepublishOnly` guard that aborts any publish, so do
not remove that setting. `npm run build:lib` also copies `README.md` and `LICENSE` into
`dist`, which ng-packagr cannot do itself because both sit outside its project root.

The showcase app writes to `dist/showcase` rather than `dist/` so that the two builds do
not delete each other's output.

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

Design tokens live in `src/lib/styles/variables.scss` (colour palette, typography,
Bootstrap variable overrides). Shared mixins live in `src/lib/styles/common-mixins.scss`.

Caveat, and it matters when adding a component: **neither file is currently wired into
anything.** Every `@use`/`@import` of `variables.scss` in component stylesheets is
commented out, and `angular.json` has no `styles` array, so `src/styles.scss` is not
part of the build either. Component templates use Bootstrap 5 utility classes and Font
Awesome icon classes that this repo does not bundle. The consuming application supplies
them. A new component should assume the same and rely on Bootstrap classes rather than
importing `variables.scss`, until the styling pipeline is reconnected.

---

## Known gaps

Recorded so they are not rediscovered as surprises.

- **Four runtime dependencies are declared in the root `devDependencies`:** `ngx-mask`,
  `date-fns`, `uuid`, and `zxcvbn`. All four are imported by shipped `src/lib/` code.
  `uuid` backs `Base`, which nearly every component extends. This is now cosmetic for
  consumers, because all four are declared as `peerDependencies` in
  `projects/common-lib/package.json` and npm installs them, but the root manifest still
  misfiles them.
- **`npm run lint` reports 415 problems: 11 errors and 404 warnings.** ESLint had never
  actually run in this repo before the Node 22 work added the missing `eslint`
  dependency, so all of these are pre-existing findings, not regressions. None of them
  is auto-fixable.

  Four rules are set to `warn` rather than `error` on purpose, so that the pre-commit
  hook can block genuinely new problems without rejecting every commit that touches an
  already-affected file. Three are high-volume style debt: `member-ordering` (150),
  `no-explicit-any` (128), and `no-underscore-dangle` (112, the `ControlValueAccessor`
  idiom). The fourth, `no-output-native` (9), flags public `blur` and `select` outputs
  on eight components; renaming those breaks every consuming app's template bindings,
  so it needs an API decision rather than a drive-by fix. Promote each back to `error`
  in `eslint.config.js` as it is cleared.

  That leaves 2 errors, which do block a commit: `templateAccessibility` findings on a
  click handler in `password.component.html` that has no keyboard equivalent. That
  config was not in the old `.eslintrc.json` and was added deliberately with the flat
  config. It is a sound default for a component library, and it caught a real
  accessibility gap, so it stays blocking until the handler is fixed.
- **`npm audit`: 8 high-severity advisories in production dependencies**
  (`@angular/*`, `@ng-select/ng-select`), 33 total including dev. Clearing the Angular
  ones requires an Angular 20 upgrade.
- **`AccordionCommonComponent` and `SampleModalComponent` still reference removed
  ngx-bootstrap markup.** `AccordionCommonComponent` emits `<accordion>`, an unknown
  element, and compiles only because of its `NO_ERRORS_SCHEMA`. `SampleModalComponent`
  carries a `bsModal` attribute on a plain `<div>`, which Angular does not validate, so
  it needs no schema. Neither behaves correctly without a modal library.
- **The Jest transform is driven by a preset that does not declare support for the
  installed Jest.** `@angular-builders/jest@19.0.1` pins `jest-preset-angular@14.5.4`
  exactly, and that copy peer-requires `jest ^29` while the repo runs Jest 30. An
  `overrides` entry forces the resolution. All 146 tests pass, but nothing guards this
  combination; it clears on an `@angular-builders/jest` major that supports Jest 30.
  Note this is separate from the root `jest-preset-angular@16.2.0` that
  `setup-jest.ts` imports. The two-version split predates the Node 22 work.
- **The library is not published to any registry yet.** The packaging works and the
  artifact has been verified against a fresh Angular 19 application, but no registry
  account has been set up. Until then, consumers take the tarball from `npm run
  pack:lib` or link it with yalc.

---

## Compatibility shim

`SharedCoreModule` is exported as an empty `NgModule` so apps that previously imported
the old library module keep compiling. It declares and exports nothing. Migrate to
importing individual standalone components directly.
