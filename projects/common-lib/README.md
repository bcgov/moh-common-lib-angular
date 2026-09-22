# moh-common-lib-angular

Shared Angular component library for BC Ministry of Health applications. Provides
reusable standalone components, validator directives, services, models, and helpers
for building government form-driven applications, plus a secondary entry point for
captcha support.

## Install

```bash
npm install moh-common-lib-angular
```

## Peer dependencies

Install these alongside the library. Ranges are exact matches to the published
`peerDependencies`.

| Package | Range |
|---|---|
| `@angular/common` | `^19.2.0` |
| `@angular/core` | `^19.2.0` |
| `@angular/forms` | `^19.2.0` |
| `@angular/router` | `^19.2.0` |
| `@ng-select/ng-select` | `^14.7.0` |
| `date-fns` | `^4.1.0` |
| `ngx-bootstrap` | `^19.0.2` |
| `ngx-mask` | `^19.0.7` |
| `rxjs` | `^7.8.0` |
| `uuid` | `^11.1.0` |
| `pdfjs-dist` | `^4.10.38` (optional) |

`ngx-bootstrap` is required by any app that renders anything from the main entry
point, not only apps that use `common-street` or `common-address-validator`: the main
bundle imports `ngx-bootstrap/typeahead` at the top level, so the package has to
resolve even if your app never touches the geocoder. The `moh-common-lib-angular/captcha`
entry point imports only `@angular/*` and does not need it.

`pdfjs-dist` is optional. Install it only if your app uses `FileUploaderComponent` to
accept PDF uploads; apps that restrict uploads to images do not need it.

If your app sets `[useGeoCoder]="true"` on `common-street`, or renders
`common-address-validator` at all, it also needs an Angular animations provider:
`provideAnimations()` or `provideNoopAnimations()` (or the `BrowserAnimationsModule` /
`NoopAnimationsModule` equivalents). ngx-bootstrap's typeahead suggestion dropdown
declares an Angular animation, and without a provider Angular rejects it when the
dropdown opens. `@angular/animations` is deliberately not a peer dependency here:
nothing in the built bundle imports it.

## Usage

Components are standalone, so import the classes you need directly and add them to
your own component's `imports` array.

```ts
import { Component } from '@angular/core';
import { EmailComponent } from 'moh-common-lib-angular';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [EmailComponent],
  template: `<common-email [(value)]="email" [required]="true"></common-email>`,
})
export class ExampleComponent {
  email = '';
}
```

If your own component is still declared in an `NgModule` rather than standalone,
import `SharedCoreModule` instead of listing each component individually. It imports
and re-exports every component and validator directive in the Catalogue below, except
`PasswordComponent`, which this library does not export at all.

```ts
import { NgModule } from '@angular/core';
import { SharedCoreModule } from 'moh-common-lib-angular';

@NgModule({
  declarations: [ExampleComponent],
  imports: [SharedCoreModule],
})
export class ExampleModule {}
```

## Styles

Component templates use Bootstrap 5 utility classes and Font Awesome 4.7 icon classes
(Font Awesome 5+ also works if you load its v4 shims stylesheet, `css/v4-shims.css`,
alongside it, since templates use FA4 class names). This library does not bundle
either; your application must supply them (for example, by including Bootstrap 5 and
Font Awesome stylesheets in your app's global styles).

## Catalogue

### Components (32 exported)

Address and location:

| Component | Selector | Purpose |
|---|---|---|
| `AddressComponent` | `common-address` | Composite address block: street lines, city, province, country, postal code |
| `AddressValidatorComponent` | `common-address-validator` | Debounced address typeahead against an external lookup service set via `[serviceUrl]`; with none bound, the network lookup is skipped, but the field still shows its Loading and No Results status text |
| `CityComponent` | `common-city` | City text input with character validation |
| `CountryComponent` | `common-country` | Country picker, `ng-select` dropdown or free text |
| `ProvinceComponent` | `common-province` | Province picker, `ng-select` dropdown or free text |
| `StreetComponent` | `common-street` | Street input, with an optional BC Geocoder typeahead behind `[useGeoCoder]` (default `false`) |

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
| `XiconButtonComponent` | `common-xicon-button` | Small "x" close/remove button, emits `clickEvent` |
| `DropdownComponent` | `common-dropdown` | Generic ng-select single-select dropdown; object items display `item.label`, value is the whole item |
| `DateComponent` | `common-date` | Date input with optional range or future/past restriction |
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

### Validator directives

All seven are exported, each paired with a bare `ValidatorFn` for reactive forms.

The selectors are **attribute** selectors, which matters under standalone: an
unmatched attribute raises no compile error, so a control that forgets to add the
directive class to its `imports` silently validates nothing. Import the class, not
just the attribute.

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
a captcha does not pay for it.

| Export | Kind | Notes |
|---|---|---|
| `CaptchaComponent` | component | `common-captcha`. Image or audio challenge, emits a JWT through `onValidToken` |
| `CaptchaModule` | NgModule | Compatibility module for apps that import an NgModule. Imports and exports the standalone component and provides `CaptchaDataService` |
| `CaptchaDataService` | service | Fetch, verify and audio calls against the captcha API |
| `CAPTCHA_STATE` | enum | The six states the component moves through |
| `ServerPayload` | type | Response shape returned by `CaptchaDataService` calls |

```ts
import { CaptchaModule } from 'moh-common-lib-angular/captcha';
```

### Services

| Service | Purpose |
|---|---|
| `AbstractHttpService` | Base class for HTTP API services. Supplies `get`/`post`, uuid generation, attachment upload. |
| `GeocoderService` | BC Geocoder address lookup, returns `GeoAddressResult[]` |
| `CommonLogger` / `CommonLogEvents` | Splunk-bound application logging. `log()`/`logError()` are `void`; a subclass that needs the underlying `Subscription`/`Observable` overrides them and calls the protected `_log()`/`_logError()` instead (since 2.5.0) |
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

## More information

Source, changelog, and contributing guidelines live at
https://github.com/bcgov/moh-common-lib-angular.
