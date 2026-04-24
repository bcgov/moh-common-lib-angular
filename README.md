# moh-common-lib-angular

Shared Angular component library for BC Ministry of Health applications. Provides reusable standalone components, services, models, and helpers consumed by apps such as `fpcare`.

Built with Angular 19 and distributed locally via [yalc](https://github.com/wclr/yalc) during development.

---

## Contents

### Components

| Component | Description |
|---|---|
| `AddressComponent` | Full address entry form |
| `AddressValidatorComponent` | Address entry with geocoder validation |
| `AccordionCommonComponent` | Collapsible accordion |
| `ButtonComponent` | Styled button |
| `CheckboxComponent` | Checkbox input |
| `CityComponent` | City text input |
| `CountryComponent` | Country selector |
| `EmailComponent` | Email input with validation |
| `ErrorContainerComponent` | Displays form/page errors |
| `FullNameComponent` | First + last name fields |
| `HeaderComponent` | Page header |
| `NameComponent` | Single name field |
| `PhnComponent` | BC Personal Health Number input |
| `PhoneNumberComponent` | Phone number input |
| `ProvinceComponent` | Province selector |
| `RadioComponent` | Radio button group |
| `SampleModalComponent` | Example modal dialog |
| `SinComponent` | Social Insurance Number input |
| `StreetComponent` | Street address input |

### Services

| Service | Description |
|---|---|
| `AbstractHttpService` | Base class for HTTP API services with XSRF support |
| `GeocoderService` | BC Geocoder address lookup |
| `PageStateService` | Tracks wizard/page navigation state |
| `ContainerService` | Manages wizard container and progress steps |
| `RouteGuardService` | Route guard using page state |
| `AbstractPageGuardService` | Base class for page guards |
| `DefaultPageGuardService` | Default page guard implementation |
| `LoadPageGuardService` | Guard for page load conditions |
| `AbstractPgCheckService` | Base class for page completion checks |
| `CheckCompleteBaseService` | Base service for checking page completion |
| `CommonLogger` / `CommonLogEvents` | Application-level logging |

### Models

| Export | Type | Description |
|---|---|---|
| `Base` | Class | Base model with common fields |
| `Address` | Class | Address data model |
| `Person` | Class | Person data model |
| `SimpleDate` | Interface | Year/month/day date structure |
| `AbstractForm` | Class | Base reactive form class |
| `AbstractBaseForm` | Class | Extended base form class |
| `AbstractFormControl` | Class | Base form control class |
| `AbstractReactForm` | Class | React-style form base |
| `Container` | Class | Wizard container model |
| `WizardProgressItem` | Interface | Wizard step/progress item |
| `ErrorMessage` | Interface | Structured error message |
| `CommonImage` | Class | Image model with processing support |
| `LETTER`, `NUMBER`, `SPACE` | Constants | Input mask character constants |

### Helpers

| Export | Description |
|---|---|
| `deburr` | Strips diacritics from strings |
| `scrollTo` / `scrollToError` | Smooth scroll utilities |
| `MoHCommonLibraryError` | Custom library error class |

---

## Development

### Prerequisites

- Node.js 18+
- Angular CLI 19: `npm install -g @angular/cli`
- [yalc](https://github.com/wclr/yalc) for local publishing: `npm install -g yalc`

### Install dependencies

```bash
npm install
```

### Build

```bash
ng build
```

Artifacts are output to `dist/`.

### Local publishing (yalc)

To test the library in a consuming app locally:

```bash
# In this repo — publish to local yalc store
yalc publish

# In the consuming app
yalc add moh-common-lib-angular
```

After making changes, push updates to linked apps:

```bash
yalc push
```

### Run unit tests

```bash
npm test
```

Tests run with [Jest](https://jestjs.io/) via `@angular-builders/jest`.

### Lint

```bash
ng lint
```

### Format

```bash
npm run prettier
```

Prettier is enforced on commit via Husky + lint-staged.

---

## Compatibility shim

`SharedCoreModule` is exported as a no-op `NgModule` for apps that previously imported the library's NgModule. Consuming apps should migrate to importing individual standalone components directly.

---

## Notes

- `PasswordComponent` depends on `zxcvbn` which may not be a dependency in all consuming apps — import it directly from the source if needed.
- `ConsentModalComponent` is present in the source but not exported from the public API as its implementation is incomplete.
