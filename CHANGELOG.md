## 2.1.0 (2026-09-15)

This release adds the components and the captcha secondary entry point that fpcare and
fpincome need to move off the legacy moh-common-lib, closes the packaging gap the 2.0.0
notes flagged (ConfirmTemplateComponent and four validator directives are now actually
exported), and fixes several form-binding defects, two of them (province and city) found
in this rework pass. No export, selector, input, or output was removed or renamed.

### Breaking

- None.

### Added

- Nine new components, all exported from the library barrel: `PageFrameworkComponent`
  (`common-page-framework`), `PageSectionComponent` (`common-page-section`),
  `FormActionBarComponent` (`common-form-action-bar`), `PostalCodeComponent`
  (`common-postal-code`), `WizardProgressBarComponent` (`common-wizard-progress-bar`),
  `FileUploaderComponent` (`common-file-uploader`, with `PdfService` and the
  `FileUploaderMsg` type) and `ThumbnailComponent` (`common-thumbnail`),
  `CoreBreadcrumbComponent` (`common-core-breadcrumb`), and `ConsentModalComponent`
  (`common-consent-modal`).
- A new secondary entry point, `moh-common-lib-angular/captcha`, exporting
  `CaptchaModule`, `CaptchaComponent` (selector `common-captcha`), `CAPTCHA_STATE`,
  `CaptchaDataService`, and the `ServerPayload` type, so an app that never renders a
  captcha does not pay for it.
- `ConfirmTemplateComponent` (`common-confirm-template`, with the `ApiStatusCodes` enum)
  and four validator directives that the 2.0.0 changelog listed as written but not
  shipped are now actually exported from the barrel and present in the package:
  `ValidateCityDirective`, `ValidateNameDirective`, `ValidateStreetDirective`, and
  `DuplicateCheckDirective`, each alongside its helper function (`commonValidateCity`,
  `commonValidateName`, `commonValidateStreet`, and `commonDuplicateCheck`). Three more
  validator directives are new: `ValidatePostalcodeDirective`, `ValidateBcPostalDirective`,
  and `ValidateRegionDirective`, with `commonValidatePostalcode`, `commonValidateBcPostal`,
  and `commonValidateRegion`.
- `DefaultPageGuardService` now also exports the `BYPASS_GUARDS` and `START_PAGE_URL`
  tokens it already used internally.
- The README inside the npm package is now a consumer guide (install, peer dependencies) instead of the repository's development README.
- Repo-only: Storybook documentation for every exported component and the captcha entry
  point. Not part of the published package.
- Repo-only: a manual `workflow_dispatch` recovery route on the release workflow, for
  re-running a release that failed before the npm publish step. No effect on consumers.

### Fixed

- Selecting a province from the `common-province` dropdown threw, because the
  `(ngModelChange)` handler assumed a DOM event and read `.target.value` off the string
  ng-select actually emits. Selecting a province now updates the bound value instead of
  throwing, and clearing an optional province sets the value to `null`.
- Clearing a `common-city` field left the bound value at whatever was last typed: the
  empty string is falsy, so the change handler's `if (value)` guard skipped calling
  `onChange`. Clearing the field now updates the bound value and control state.
- `CityComponent`, `EmailComponent`, `NameComponent`, `PhnComponent`, and
  `ProvinceComponent` called the reactive-forms `onChange` callback with a hardcoded
  `true` instead of the typed value. `PhoneNumberComponent` had the same effect from
  `this.phoneNumber ? true : false`, a computed boolean rather than a hardcoded one. A
  form control bound to one of these fields (for example `formControlName="city"`) held
  `true`/`false` instead of what the user typed. All six now hold the real value, for
  both `[(ngModel)]` and reactive forms; a cleared required field is now invalid where it
  previously stayed valid.
- `AddressComponent` threw NG01203 when rendered: the component itself declared
  `schemas: [NO_ERRORS_SCHEMA]` (not a test schema), masking five child components and
  four validator attributes it referenced but never imported.
- `SampleModalComponent.openModal()` called `.show()` on a `ViewChild` that never
  matched, throwing a `TypeError`.
- Three click handlers gained keyboard equivalents for accessibility: the close control
  on the existing `SampleModalComponent`, and one each in the new `FileUploaderComponent`
  and `ThumbnailComponent`.

### Changed

- `common-sin` and `common-phone-number` now provide their own `ngx-mask` config
  (`providers: [provideNgxMask()]`), instead of importing `NgxMaskDirective` and relying
  on an app-level `provideNgxMask()`. An app no longer needs to provide one just for
  these two fields, and an app-level ngx-mask config (for example
  `dropSpecialCharacters`) no longer reaches them, so the masked value they emit can
  change shape if your app-level config differed from the library default.
- `pdfjs-dist` (`^4.10.38`) is a new peer dependency, but it is declared optional
  (`peerDependenciesMeta.pdfjs-dist.optional`) and loaded through a dynamic import with a
  catch, so a consumer that never uses `FileUploaderComponent` does not need to install
  it. It is used only by `PdfService`, which `FileUploaderComponent` injects; the captcha
  entry point does not import it.

### Consumer action required

- If your app binds a form control to `common-city`, `common-email`, `common-name`,
  `common-phn`, `common-phone-number`, or `common-province` and reads the control's value
  (rather than only the component's own value or valueChange output), check that code:
  the control now receives the typed value instead of a boolean, and a cleared required
  field is now invalid.
- If your app sets an app-level ngx-mask config and relies on it applying to
  `common-sin` or `common-phone-number`, check the value those fields now produce; they
  no longer pick up that config.
- Install `pdfjs-dist@^4.10.38` only if you use `FileUploaderComponent`. The captcha
  entry point does not need it.
- Otherwise nothing: the new components and the captcha entry point are additive.

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
- **Declared `peerDependencies`.** `ngx-mask`, `date-fns`, and `uuid` are imported by
  shipped code but were only ever listed in the root `devDependencies`, so every consumer
  had to discover them. npm now installs them. The full peer set matches the external
  imports in the shipped bundle exactly: `@angular/common`, `@angular/core`,
  `@angular/forms`, `@angular/router`, `@ng-select/ng-select`, `date-fns`, `ngx-mask`,
  `rxjs`, and `uuid`. `zxcvbn` is deliberately not among them, because its only importer
  is the unexported `PasswordComponent` and it is therefore absent from the bundle.
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
