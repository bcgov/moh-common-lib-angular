## 2.5.0 (2026-09-22)

Restores three pieces of the pre-2.0 `moh-common-lib` 3.3.5 public contract that
`sitereg` (MOH-IAM-Enrolment) was still written against: `SharedCoreModule` was an
empty shim, `DropdownComponent` did not exist as a standalone component, and
`CommonLogger` had lost the protected `_log()`/`_logError()` split a `log()`/
`logError()` override needs. The return-type narrowing below ships in a minor because
it restores the 3.3.5 contract rather than breaking a new one, and no consumer this
library can see - fpcare, msp, or sitereg - uses the value `log()`/`logError()` used
to return.

### Breaking

- `CommonLogger.log()` and `.logError()` now return `void` instead of
  `Subscription | Observable<never>`, matching 3.3.5. A consumer that used the
  returned value must subclass `CommonLogger` and call `this._log(...)` /
  `this._logError(...)` from inside it; `_log`/`_logError` are protected and cannot be
  called from outside the class. `logHttpError()` now calls `_logError()` directly
  rather than the public `logError()`, matching 3.3.5's own implementation - a
  subclass that overrides `logError()` to change behaviour (for example, sitereg's
  `LoggerService` skipping the send while debugging) no longer sees HTTP errors
  through that override; they go straight to `_logError()`.

### Added

- `SharedCoreModule` now imports and exports every standalone component and
  validator directive the entry point exports, except `PasswordComponent`. Captcha
  stays in its own `moh-common-lib-angular/captcha` entry point, unchanged.
- `DropdownComponent` (`common-dropdown`), a standalone `ng-select`-backed
  single-select dropdown restoring 3.3.5's `DropdownComponent`. Inputs: `label`,
  `items`, `value`, `labelforId`, `placeholder`, `required`, `clearable`, `addTag`,
  `addTagText`. Outputs: `valueChange`, `blur`, plus `ControlValueAccessor`/
  `formControlName` support. 3.3.5's `autocorrect` input is dropped: ng-select 14 has
  no matching input. 3.3.5's `model` property is renamed `value`, matching every other
  single-value control's `value`/`valueChange` convention. Extends `AbstractFormControl`
  rather than `Base`, unlike 3.3.5.
- `CommonLogger` regains the protected `_log()` / `_logError()` methods 3.3.5 had.
  `log()` and `logError()` are now thin `void`-returning wrappers around them,
  matching 3.3.5 exactly. A subclass that overrides `log()`/`logError()` and calls
  `this._log(...)` / `this._logError(...)` - the pattern sitereg's `LoggerService`
  was written against - compiles again.

### Consumer action required

- `common-radio`'s `statusChange` and `common-city`/`common-street`'s `maxlen` are
  not restored: 3.3.5 never had them either (`valueChange` and `maxlength` are
  correct in both versions). An app using those names has its own drift to fix.
- An app that already imports `SharedCoreModule` (for example fpcare's `CoreModule`,
  fpincome) now pulls every component and directive into its bundle instead of
  nothing, losing tree-shaking on that import. Import individual standalone
  components instead where bundle budget matters.

## 2.4.0 (2026-09-21)

Leads with a fix for anyone running 2.3.0's `common-date` bounds validation: it could
pin the browser in an endless change-detection loop, and that fix is the most important
thing in this release. The rest closes gaps found while wiring msp against this library:
five default error-message constants and four already-referenced types were declared but
unreachable through the public entry point, `AbstractHttpService.handleError()` declared
a return type that was a lie for any consumer that swallows the error rather than
rethrowing it, and `common-form-action-bar`'s disabled state was cosmetic only. No
export, selector, input or output was removed or renamed.

### Breaking

- None. `AbstractHttpService.handleError()`'s abstract return type widens from
  `Observable<never>` to `Observable<unknown>`; every existing implementation, in this
  library and outside it, already satisfies the wider type unchanged (see Changed below).
  No peer dependency was added or changed.

### Added

- Five default error-message constants, plus the function that applies them, are now
  exported from the public entry point: `RequiredMsg`, `InvalidMsg`, `DuplicateMsg`,
  `RegionCharsMsg`, and `replaceLabelTag`. They were already declared in
  `error-message.interface.ts` and used internally, but nothing reached `public-api.ts`.
  `ErrorMessage.required` has been mandatory since 2.0.0, where legacy `moh-common-lib`
  3.6.2 had it optional, so every consumer must supply it - and without this export, the
  only way to match this library's own wording was to retype `'{label} is required.'` by
  hand. msp does exactly that 53 times (38 in `moving-information.component.ts`, 15 in
  `update-child.component.ts`) because it had no constant to import.
- Four types the exported API already references can now be named directly by a typed
  consumer: `CommonImageScaleFactors` (returned by the exported
  `CommonImageScaleFactorsImpl.scaleDown()`), `PageListInterface` (consumed by
  `CheckCompleteBaseService.pageCheckList`), `PageList` (consumed by
  `PageStateService.pageList`), and `CommonLogMessage` (the argument type of
  `CommonLogger.log()` and `.logError()`). `MaskModel` and `DefaultSubmitLabel` stay
  internal, and `PasswordComponent` stays unexported; both remain deliberate and
  unchanged.

### Fixed

- `common-date` could pin the browser in an endless change-detection loop. 2.3.0 taught
  `ngOnChanges` to revalidate when `dateRangeStart` or `dateRangeEnd` changed, but Angular
  reports a change by reference, so a parent that rebuilds the bound `Date` on every pass
  (a getter, or `ngDoCheck` recomputing a range) looked like a real change each time.
  `revalidate()` then scheduled a microtask, the microtask scheduled another pass, and the
  parent rebuilt the `Date` again. The renderer sat at 100% CPU and never settled; the page
  never became interactive.
  The bounds are now compared by value, so an equal instant in a new object is not treated
  as a change. A real change still revalidates, which is what 2.3.0 set out to fix.
  Found in MOH-MSP-Enrolment, whose `personal-information` component assigns fresh
  `subYears`/`addDays` results to the bound range inside `ngDoCheck`. Diagnosed from five
  `Debugger.pause` samples during the hang, every one inside Angular's change-detection
  internals.
- `common-form-action-bar` toggled only a CSS class when `canContinue` was false, while
  `onClick()` already gated the emit on the same flag. A button that looks disabled but
  carries no `disabled` attribute stays in the tab order and reachable to a screen reader,
  with no programmatic signal that activating it does nothing - a WCAG failure. The button
  now also binds `[disabled]="!canContinue || isLoading"`, alongside the existing
  `.disabled` class used for styling. Bootstrap's own stylesheet already applies an
  identical rule to both `.btn.disabled` and `.btn:disabled` (`.btn:disabled, .btn.disabled
  { color, background-color, border-color, opacity, pointer-events }`, one shared
  declaration block), so a Storybook render with Bootstrap loaded is pixel-identical
  before and after this change; only the semantics improve. Mouse behaviour is unchanged,
  because `onClick()` already made a disabled click inert.

### Changed

- `AbstractHttpService.handleError()`'s abstract return type widens from
  `Observable<never>` to `Observable<unknown>`. Every implementer inside this library
  throws or rethrows, so `Observable<never>` was accurate for them, but it was never
  honest for a consumer that swallows the error and returns a fallback value instead -
  common enough that msp's own services do it five times, and the legacy moh-common-lib
  3.6.2 consent modal did it too. Under the old signature, returning a real value required
  `return of(error) as unknown as Observable<never>`: a cast asserting the opposite of
  what the code actually does. `Observable<unknown>` accepts either shape, throwing or
  returning a value, with no cast at all.
  `AbstractHttpService.get<T>()` and `.post<T>()` are unaffected: `setupRequest<T>()` is
  `handleError()`'s only caller, and it reconciles the type back to `T` in exactly one
  place, with a single explicit `as Observable<T>` cast that replaces the implicit one
  `Observable<never>` used to provide for free.
  `Observable<any>` was tried and rejected even though it also happened to leave
  `post<T>()`'s typing intact here (`setupRequest<T>`'s own return annotation is explicit,
  so the boundary re-asserts `T` regardless) - `unknown` was kept because it does not
  silently admit an unrelated value anywhere else a future caller of `handleError()`
  might use its result, and this repo's lint config already tracks `no-explicit-any` as a
  (ratcheted) warning.

### Consumer action required

- Nothing to change to adopt this release. Every item above is additive or widening: five
  new named exports, four new named types, and a strictly wider abstract method signature
  that every existing subclass, in this library or outside it, already satisfies without
  modification.
- If your app renders `common-form-action-bar` and depended on the submit button staying
  focusable or clickable while `canContinue` is false - relying on the earlier,
  cosmetic-only disabled state - that no longer holds: the button is now genuinely
  disabled (out of the tab order, inert to click, and announced as disabled) whenever
  `canContinue` is false or `isLoading` is true.
- Upgrade from 2.3.0 if you render `common-date` with a bound `dateRangeStart` or
  `dateRangeEnd`; see Fixed above. No API changed and no peer dependency moved for that
  fix, so the upgrade is a version bump and nothing else.
- Worth checking regardless of this release: a parent that hands `common-date` a freshly
  built `Date` on every change-detection pass was always doing more work than it needed
  to. This release makes that harmless rather than fatal, but computing the bound once, or
  only when its inputs change, is still the better shape.

## 2.3.0 (2026-09-21)

This release exists to unblock MOH-MSP-Enrolment's `msp` app, which is moving from
Angular 7 to Angular 19 and from the legacy `moh-common-lib` 3.6.2 to this package. msp
renders 26 of this library's selectors and imports 39 of its symbols, and it was the first
consumer to need surface that 2.2.0 did not have. It adds the two components msp renders
that had no equivalent here, exports fifteen symbols that were already declared but
unreachable, restores one legacy method name, and fixes a change-detection defect that
every consumer of `common-consent-modal` has been hitting. No export, selector, input or
output was removed or renamed.

### Breaking

- None. Nothing was removed or renamed, and no peer dependency was added or changed.

### Added

- `common-date` (`DateComponent`), ported from `moh-common-lib` 3.6.2. A three-field
  month/day/year date entry implementing `ControlValueAccessor`, so it binds through
  `ngModel` or `formControlName` like any other control. `@Input()` surface: `date`,
  `label`, `restrictDate` (`'future' | 'past' | 'any'`), `dateRangeStart`, `dateRangeEnd`,
  plus `disabled` and `errorMessage` inherited from `AbstractFormControl`.
  `@Output() dateChange` emits the assembled `Date`, or `null` once the fields are
  cleared. It self-validates and can report `dayOutOfRange`, `invalidValue`,
  `invalidRange`, `noPastDatesAllowed`, `noFutureDatesAllowed`, `yearDistantPast` and
  `yearDistantFuture` alongside the host's `required`. Combining `restrictDate` with
  either `dateRange` input throws `MoHCommonLibraryError`, because the two configure the
  same underlying bounds; that fail-fast is carried over deliberately.
  The legacy component reached `date-fns` through v2-style default deep imports
  (`import getDaysInMonth from 'date-fns/getDaysInMonth'`), a form v4 removed. All nine
  functions it uses are now named imports from the package root. `date-fns ^4.1.0` has
  been a peer dependency since 2.2.0, so this adds no new requirement.
- `[commonDateFieldFormat]` (`DateFieldFormatDirective`), also ported from 3.6.2 and
  exported in its own right. `common-date` puts it on the day and year inputs, where it
  strips non-digits and truncates to the field's `maxlength` as the user types.
- `common-xicon-button` (`XiconButtonComponent`), ported from 3.6.2. A small circled-x
  remove control. `@Input() label` is mandatory and its absence throws
  `MoHCommonLibraryError` at init, because the label is the button's only accessible
  name. `@Output() clickEvent` fires on activation.
  One deliberate difference from the legacy component: it does **not** declare a `click`
  output. The 3.6.2 version declared both `clickEvent` and `click`, and the latter shadows
  the native DOM event, which `@angular-eslint/no-output-native` rejects. Consumers
  binding `(click)` are unaffected - with no output declared, Angular attaches a native
  listener on the host and the inner button's click bubbles to it. This was verified in a
  browser, not inferred: a native listener on the host fires exactly once per click, with
  no double-fire.
- `ConsentModalComponent.showFullSizeView()`, a thin alias for `show()`. 2.1.0 renamed the
  method when the component was ported; this restores the legacy name so callers written
  against `moh-common-lib` 3.6.2 keep working unchanged. Both names do the same thing.
- Fifteen symbols that were declared in the library but never exported from
  `public-api.ts`, so consumers could not import them:
  `COUNTRY_LIST`, `CountryList`, `CANADA`, `getCountryDescription`, `PROVINCE_LIST`,
  `ProvinceList`, `BRITISH_COLUMBIA`, `getProvinceDescription`, `LabelReplacementTag`,
  `SampleImageInterface`, `CommonAttachmentJson`, `AddrLabelList`, `Maxlengths`,
  `ReadOnlyFields` and `IRadioItems`.
  Four of those were not merely inconvenient but impossible to work around:
  `AddressComponent` declares `@Input() labels!: AddrLabelList`,
  `@Input() maxlengths!: Maxlengths` and `@Input() disabled: boolean | ReadOnlyFields`,
  and `RadioComponent` declares `@Input() radioLabels: IRadioItems[]`, so a typed consumer
  had no way to name the shape those inputs require.

### Fixed

- `common-consent-modal` raised `NG0100:
  ExpressionChangedAfterItHasBeenCheckedError: Previous value for 'display': 'none'.
  Current value: 'block'` on every open. `show()` set `isOpen = true` synchronously, and
  hosts normally call it from `ngOnInit` or `ngAfterViewInit`, which run after this
  component's own bindings have already been checked; the `[style.display]` binding then
  changed before Angular's verification pass. `show()` now settles its own view through an
  injected `ChangeDetectorRef`.
  The error is raised only in development builds, since production skips
  `checkNoChanges`, and the modal always displayed correctly either way. It is fixed here
  because it fired for every consumer on every open and filled the console.
  Worth recording how it was found: the library's own 518 tests and the consuming app's
  341 unit tests were all green. It surfaced only when that app's end-to-end specs ran in
  a real browser and asserted zero `console.error` calls.

- `common-date` kept stale validity when its bounds moved. `restrictDate` was translated
  into a range only in `ngOnInit`, so changing it later had no effect at all, and changing
  `dateRangeStart` or `dateRangeEnd` updated the bounds but never re-ran the validator. A
  value entered under the old rule kept its old errors, or its absence of them. This
  matters for any form that derives a bound from another field: msp binds
  `[dateRangeStart]` to a spouse's or child's date of birth, which changes as the user
  edits it. The bounds are now recomputed when `restrictDate` changes, and the control is
  revalidated whenever any of the three inputs change. Returning `restrictDate` to `'any'`
  also removes the bound the restriction had installed, which it previously left behind,
  so lifting a `'past'` restriction no longer keeps rejecting future dates. Only the
  restriction's own bound is cleared; an explicit `dateRange*` value is left alone.
- `common-date` validated against the day the page was opened rather than the current one.
  The 150-year limits were computed once at module load and `today`/`tomorrow` once per
  component, and `restrictDate` materialised its bound from that snapshot. A session left
  open across midnight therefore kept rejecting the new day: with `restrictDate="past"`,
  today's date began failing as a future date. All of these are now computed when they are
  read, and a `restrictDate` bound is refreshed before each range check.
- The documentation on `restrictDate` described the opposite of what the code does. It
  read `"future" includes today, "past" does not`, while `'past'` allows today and
  `'future'` starts from tomorrow. Anyone configuring the restriction from that comment
  would have chosen the wrong value. Corrected, and expanded to note that combining it
  with the `dateRange*` inputs throws.
- `[commonDateFieldFormat]` emptied any input that had no `maxlength`. The directive read
  the attribute and truncated with `Number(maxlength)`, which is `0` when the attribute is
  absent, so every keystroke was replaced with an empty string. Harmless on the two fields
  inside `common-date`, which both carry a `maxlength`, but the directive is exported for
  use on any input, where it was destructive. It now truncates only when the host carries
  a usable positive `maxlength`, and still strips non-digits either way.
- `common-date`'s `date` input did not reach the fields. It is a public `@Input()` paired
  with `dateChange`, so `[(date)]` is a supported alternative to the forms API, but
  `ngOnChanges` only handled `errorMessage` and nothing called `setDisplayVariables()`
  outside `writeValue`. `<common-date [date]="selectedDate">` therefore rendered three
  blank fields while the component held a date, including for a value bound before first
  render. Changes to `date` now update the day, month and year fields, and clear them
  when it becomes null. Also carried over from moh-common-lib 3.6.2.
- `common-date` emitted a rolled-over date for an impossible calendar day. `new Date()`
  turns 30 February 2020 into 1 March, and `processDate()` assigned and emitted that
  through `_onChange` and `dateChange` without checking. The form model then held a date
  the user never typed, on a control simultaneously reporting `dayOutOfRange`, while the
  inputs still showed what was entered. The model is now held empty until the three
  fields name a day that actually exists in that month; the `dayOutOfRange` error is
  unchanged. Also carried over from moh-common-lib 3.6.2.
- `common-date` ignored `writeValue(null)`, so resetting a reactive control left the
  previous date in place along with all three display fields. `formControl.reset()` or
  `setValue(null)` produced a control that reads as empty while the user still sees the
  old date on screen, and the stale `Date` could be submitted or rendered. Clearing now
  resets the `Date` and the day, month and year fields together. `writeValue(undefined)`
  is unchanged and still leaves the control alone. This defect was carried over from
  moh-common-lib 3.6.2, which has it too.

### Changed

- `public-api.ts` now emits one export statement per source file, using inline `type`
  modifiers where a file contributes both values and types. No symbol was added, removed
  or renamed by that consolidation, and the built `public-api.d.ts` re-exports every one
  of them exactly as before.

### Known issues

- `[disabled]` bound on an `AbstractFormControl` subclass (`common-phn`, `common-sin`,
  `common-date`, `common-city` and the rest) is overridden when a form directive is
  attached to the same element. `NgModel` calls `setDisabledState` during setup, which
  resets the value the input just supplied. This is standard Angular behaviour for a
  `ControlValueAccessor` rather than a defect here, and it predates this release; disable
  the control through the form API instead. `[errorMessage]` on the same components is
  unaffected and binds normally.

### Consumer action required

- None. No peer dependency was added or changed, and nothing needs updating in an app
  already running 2.2.0.
- If you are migrating from legacy `moh-common-lib` 3.6.2 and render
  `common-xicon-button`, note the missing `click` output described under Added. Binding
  `(click)` continues to work; `(clickEvent)` is the explicit output.
- Unchanged from 2.1.0, and worth restating because it is the single largest cost of
  migrating off the legacy package: `SharedCoreModule` is an empty compatibility shim. It
  declares and exports nothing, where the 3.6.2 module declared and exported 46 items and
  provided `NgForm`. Every component in this library is standalone, so each consuming
  NgModule has to import the specific components its templates render.

## 2.2.0 (2026-09-16)

This release turns on the BC geocoder typeahead that `common-street` and
`common-address-validator` have carried in source but never rendered, which is why it
adds `ngx-bootstrap` as a peer dependency, and it fixes seven binding and styling
defects. It also corrects two dead bindings that could never have fired, which change
nothing observable on their own. No export, selector, input, or output was removed or
renamed.

### Breaking

- No API break: nothing was removed or renamed. There is one new hard requirement,
  though. `ngx-bootstrap` `^19.0.2` is a mandatory peer dependency now, not an
  optional one, because the main entry point imports `ngx-bootstrap/typeahead` at the
  top level: an app that never touches the geocoder still fails to resolve without it.
  npm 7 and later install missing peers automatically, so this only bites a build
  running `--legacy-peer-deps` or a hand-curated lockfile, which is why the bump stays
  minor. See Consumer action required below.

### Added

- `common-street` now offers BC geocoder suggestions when `[useGeoCoder]="true"`. The
  input still defaults to `false`, and with it off the component renders exactly the
  plain text field it rendered in 2.1.1, so existing usage does not change. With it on,
  the field queries the geocoder once the user has typed three characters and paused
  for 500ms. Choosing a suggestion puts the street portion, not the full address, into
  the bound form control, and emits `(select)` with the whole `GeoAddressResult`:
  street, city, and `country`/`province` overwritten with Canada and British Columbia.
- `common-address-validator`'s typeahead now renders. The markup for it shipped in
  2.1.1 inside an HTML comment, and the component did not import `TypeaheadModule`, so
  the field was a plain text box: nothing subscribed to the lookup observable, so no
  request was ever made and no suggestion ever appeared. The field now shows
  suggestions from the service at `[serviceUrl]`. Unlike `common-street` it has no
  `useGeoCoder` input: its typeahead is always on, which is how it behaved before the
  markup was commented out. With no `[serviceUrl]` bound there is nothing to query, so
  the network lookup is skipped, but the field still shows its Loading and No Results
  status text instead of the error state.
- `ngx-bootstrap` `^19.0.2` is a new peer dependency, required by both of the above.
  The main entry point declared ten peers in 2.1.1 and declares eleven now; nothing was
  removed and no range was changed.

### Fixed

- `common-header` drew its white title text over whatever background it was placed on,
  because the `background-color` declaration was commented out during the Bootstrap
  migration, along with the two responsive rules beside it. The BC government blue
  background (`#036`) is back, and so are the two rules, restored from the legacy
  moh-common-lib 4.0.0 stylesheet: below 768px the header padding tightens to 2px top
  and 8px bottom, and below 576px the title drops to 24px. White on `#036` measures
  12.6:1, well above the 4.5:1 body-text minimum. Note the reference point: 2.1.1
  shipped no header media query at all, so relative to the release you are upgrading
  from these rules are new behaviour, not a restoration. Below 768px the top padding
  drops 10px to 2px, which moves the logo and title 8px up. Mobile screenshots diffed
  against 2.1.1 will show that shift.
- `common-address` listened for `(selectEvent)` on its inner `common-street`, but
  `StreetComponent` declares `@Output() select`. An unmatched output on a component
  element compiles without error and quietly becomes a plain DOM event listener, so
  the handler could never have run. Nothing observable changes here: `common-address`
  does not forward `useGeoCoder` to `common-street`, and `common-street` emits
  `select` only from the typeahead branch of its template, so no selection event
  reaches this binding in 2.1.1 or in 2.2.0. The template now binds `(select)`, which
  corrects a dead binding in advance and removes the trap waiting for whoever
  forwards `useGeoCoder` through `common-address` later.
- `common-address` registered itself against `NG_VALUE_ACCESSOR` without `multi: true`.
  That token is a multi-provider, so `@angular/forms` read a single object where it
  expects an array of accessors and the control never bound. `formControlName="address"`
  now reads and writes the address through the component.
- `common-address` threw `Cannot read properties of undefined (reading 'country')` when
  used as a form control without also passing `[address]`. `ngOnInit` guards `this.addr`
  everywhere else but called `updateProvList()` unguarded, and a reactive form's
  `writeValue` does not land until after `ngOnInit`. `updateProvList()` now returns
  early when there is no address yet, the same way it already did for a province list
  that has not loaded.
- `common-phn`'s `validatePhn()` rewrote `this.phn` with its own cleaned-up copy of the
  value: trimmed, leading zeros removed, underscores and spaces stripped. Validation
  runs on every value change, so a user's masked input was being edited underneath them
  as they typed. The checksum now runs against a local copy and the field keeps what the
  user entered.
- Choosing a geocoder suggestion in `common-street` left the full address in the bound
  control. The typeahead writes its own option value, `fullAddress`, through the inner
  `ngModel` before `(select)` fires, and `onSelect` updated only the component's own
  `street` field. A consumer with no `(select)` handler ended up with
  `1012 Douglas St, Victoria, BC` in a street field. `onSelect` now writes the street
  back through the control's change callback and `valueChange`, so the control, the
  component, and the rendered input agree. This applies to `common-street` used
  directly with `[useGeoCoder]="true"`; a `common-street` inside `common-address`
  never reaches the path, because `common-address` leaves the geocoder off.
- `common-address-validator` never bound its inherited `disabled` state to its input.
  `AddressComponent` passes `[disabled]="readOnlyFields.address ?? false"` down to it
  (`address.component.html:24`), but the validator's own template never forwarded that
  flag to the `<input>`, so a read-only address still rendered an editable,
  model-mutating typeahead. The template now binds `[disabled]="disabled"` on the
  input.
- Pasting into `common-address-validator` with the mouse or a context menu triggered no
  lookup at all. ngx-bootstrap's `TypeaheadDirective` does not subscribe to the lookup
  observable until one macrotask after the DOM `input` event fires, because its own
  `asyncActions()` debounces an internal `keyUpEventEmitter` at 0ms before the
  `switchMap` subscribes. The search term was pushed into a plain `Subject` from
  `(keyup)` only, and a paste fires `input` but never `keyup`, so nothing was ever
  pushed and no lookup ran. The producer moved to the native `input` event, and the
  subject became a `ReplaySubject(1)` so the term survives that one-task gap before
  ngx-bootstrap subscribes. The `ReplaySubject` is load-bearing, not incidental:
  reverting only `ReplaySubject(1)` back to `Subject`, while leaving the `(input)`
  binding wired, broke four tests, including the ordinary single-keystroke lookup and
  the no-reopen-on-selection behaviour, not just paste. Selecting a suggestion still
  triggers no lookup, because ngx-bootstrap's selection path is a programmatic
  view-to-model update that dispatches no `input` event; that is what replaces the old
  keyCode 13/9 guard structurally.
- The display-only search box inside `common-address-validator` is now explicitly
  marked `[ngModelOptions]="{ standalone: true }"`. This is not a behaviour fix, exactly
  like the `(selectEvent)` -> `(select)` correction above: `AddressValidatorComponent`
  declares no `ControlContainer` viewProviders, so the inner `ngModel` never joined a
  consumer's ambient form in the first place, and there is no observable change.
  Verified by rendering `common-address` inside a form and reading
  `Object.keys(ngForm.controls)`: the same five control keys appear with and without
  the binding.

### Known issues

- The geocoder lookup in `common-street` is order-sensitive and can silently skip a
  search. The component pushes the search term into a plain `Subject` with no replay,
  from the input's `(keyup)` handler, while `TypeaheadDirective` does not subscribe to
  the lookup observable until one task after the `input` event, because of its own
  zero-delay debounce. Typing is safe: a browser fires `input` as the character is
  inserted and `keyup` when the key is released, so the subscription is in place first
  and the term is heard. Input that fires both in the same task is not: paste from the
  mouse or context menu, and some IME paths, push the term into a subject nobody is
  listening to, and no lookup runs. This is inherited from the legacy 4.0.0 design
  rather than introduced here, and it is ticketed rather than fixed in 2.2.0. This
  release fixes the equivalent defect in `common-address-validator`'s lookup pipeline
  (see Fixed above); `street.component.ts:170` still has it, so the two should not be
  confused.
- `common-address-validator` never shows its `Error` status. The field's label can
  report `Loading`, `Selected` and `No Results`, but a failed lookup falls through to
  `No Results` instead of `Error`. `onError()` sets the `hasError` flag, and the
  typeahead then fires its loading event with `false` once the failed request settles,
  which `onLoading()` uses to clear that same flag before the label is read. The status
  is cosmetic; the field itself behaves correctly and a failed lookup still yields an
  empty suggestion list. This code is unchanged in 2.2.0 and the state was simply
  unreachable before, because the component rendered no typeahead and therefore no
  status at all. Ticketed rather than fixed here.

### Consumer action required

- If your app renders anything from the main entry point, install `ngx-bootstrap`
  `^19.0.2`. The requirement is not limited to `common-street`: the main bundle imports
  `ngx-bootstrap/typeahead` at the top level, so the package has to resolve even for an
  app that never uses the geocoder. The `moh-common-lib-angular/captcha` entry point
  imports only `@angular/*` and is unaffected.
- If your app sets `[useGeoCoder]="true"` or renders `common-address-validator`, it also
  needs an animations provider: `provideAnimations()` or `provideNoopAnimations()`, or
  the equivalent `BrowserAnimationsModule` / `NoopAnimationsModule`. ngx-bootstrap's
  `TypeaheadContainerComponent` declares `animations: [typeaheadAnimation]`, and without
  a provider Angular rejects that synthetic animation property when the suggestion
  dropdown opens. `@angular/animations` is deliberately not one of our peer
  dependencies: nothing in the built bundle imports it, so declaring it would make every
  consumer install a package our shipped code never touches.
- Neither current consumer needs a dependency change. fpincome and fpcare both already
  declare `ngx-bootstrap` `^19.0.2` and both import `BrowserAnimationsModule` in their
  root module, so both requirements above are already met. fpcare renders
  `common-address-validator`, whose typeahead is always on, so the animations provider
  matters there even though fpcare never sets `useGeoCoder`.

## 2.1.1 (2026-09-15)

This is a patch release: eight bug fixes, no new exports, no new peer dependencies, no
API additions or removals.

### Breaking

- None.

### Fixed

- `common-street` rendered only its label; the entire input, including its error
  messages, was commented out of the template. It now renders a plain `[value]`-bound
  text input wired to the component's `writeValue` `ControlValueAccessor` method and to
  `onValueChange`, a template event handler that also changed in this release so it
  keeps the component's own `street` field in sync; the field now works inside both
  template-driven and reactive forms. The typeahead/geocoder suggestion path stays
  disabled in this release; `useGeoCoder`, `(select)`, and `onSelect` are still present
  for API compatibility, but nothing currently drives them.
- `common-file-uploader` threw `NullInjectorError: No provider for NgForm` when placed
  inside a reactive `[formGroup]` host, because its `viewProviders` unconditionally
  aliased `ControlContainer` to `NgForm` and its constructor required a `ControlContainer`
  to be resolvable. It now only aliases to an ambient `NgForm` when one actually exists;
  inside a reactive form (where there is no `NgForm` to find) it resolves to `null`
  instead of throwing, and the internal file input registers as a standalone `ngModel`
  rather than trying to join the reactive form. Behaviour inside a template-driven
  `ngForm` host, including the named control lookup `fileControl` relies on, is unchanged.
  Inside a reactive host the component still does not participate in the form's
  validity: `[required]` is not enforced, `form.valid` stays `true` with zero files
  selected, and the required error message never renders. This is not a regression -
  the component previously threw on construction in that host, so there was no working
  required-file validation to lose.
- `AbstractReactForm.markAllInputsTouched()` required an explicit `FormGroup | FormGroup[]
  | null` argument even though the method already falls back to the instance's own
  `formGroup` when nothing is passed. The parameter is now optional; call sites that used
  to pass `null` only to satisfy the compiler can call the method with no argument.
- `common-phn` never delivered a typed value to a bound form control, in any earlier
  release. The template bound its masked input with `[ngModel]="phn"` but had no
  `(change)`, `(input)`, or `(ngModelChange)` binding alongside it, so `onValueChange()`,
  which already wrote the value back and called `_onChange`, was unreachable dead code.
  The input now also binds `(change)="onValueChange($event)"`, matching the pattern
  `common-street` uses; `[ngModel]` and `[mask]` are unchanged, because `NgxMaskDirective`
  registers itself as the input's `ControlValueAccessor` and needs a form directive
  (`ngModel` or `formControl`) present to work, so replacing it with a plain `[value]`
  binding would have detached the mask. The value that lands in the bound control is the
  masked display value, spaces included (for example `9999 999 998`), not the digits-only
  string; `validatePhn()` already strips whitespace, leading zeros, and underscores before
  running the checksum, so validation is unaffected. The field now works inside both
  template-driven and reactive forms.
- `common-phn`'s template was also missing a `(blur)` binding for the `onBlur()` method
  that already existed on the component, so the control was never marked touched on blur
  and the `blur` output never fired. The input now also binds `(blur)="onBlur($event)"`,
  matching every other field in the library (city, street, postal-code, sin, and
  phone-number all bind both). This is consumer-visible: the error messages in
  `common-phn`'s own template, and any consumer validation that reads `touched` off the
  bound control, now activate on blur.
- `common-phone-number`'s masked input bound `(ngModelChange)="setPhoneNumber($event)"`,
  which passes the new string value, not a DOM event. The handler assumed a `.target` on
  its argument and fell back to `''` when there wasn't one, so the masked field stored an
  empty string and cleared the bound control on every keystroke. `setPhoneNumber` now
  accepts either a string (from the masked branch) or an `Event` (from the `#NoMask`
  branch's `(input)` binding) and uses the string directly when there is no `.target`,
  the same guard shape `ProvinceComponent.onValueChange` already uses. The `#NoMask`
  branch is unaffected.
- `common-city`'s `onValueChange` dereferenced `data.target` after only checking
  `typeof data === 'object'`, and `typeof null === 'object'`, so passing `null` threw a
  `TypeError` instead of clearing the field. `onValueChange` is public, and
  `AddressComponent` calls it directly when it propagates a selected geocoder suggestion,
  so a suggestion carrying no city reached this path.
- `common-phone-number`'s template had a commented-out, dead duplicate of its own
  `<common-error-container>` block sitting above the live one. It is removed; the live
  error container is unchanged.

### Consumer action required

- Nothing. If your app renders `common-street`, it will now show an input where it
  previously showed only a label; no code change is required to get it.
- If your app renders `common-file-uploader` inside a reactive `[formGroup]` host and
  needs required-file validation there, add your own validator to the form control:
  `[required]` on the component is not enforced in that host, so the form stays valid
  with no file selected.

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
