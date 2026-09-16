import { Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TypeaheadDirective } from 'ngx-bootstrap/typeahead';
import {
  AddressResult,
  AddressValidatorComponent,
} from './address-validator.component';
import { Address } from '../../models/address.model';

/** A keyup event carrying the given keyCode. */
function keyUpWithCode(keyCode: number): KeyboardEvent {
  const event = new KeyboardEvent('keyup', { bubbles: true });
  Object.defineProperty(event, 'keyCode', { get: () => keyCode });
  return event;
}

/** A keyup that onKeyUp does not filter out (not enter, not tab). */
function typedKeyUp(): KeyboardEvent {
  return keyUpWithCode(83);
}

describe('AddressValidatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressValidatorComponent, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AddressValidatorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

@Component({
  template: `
    <common-address-validator [disabled]="disabled"></common-address-validator>
  `,
  imports: [AddressValidatorComponent],
})
class DisabledAddressValidatorHostComponent {
  disabled = true;
}

/**
 * The real-consumer path for [disabled] is common-address passing
 * [disabled]="readOnlyFields.address ?? false" (address.component.html:24)
 * straight through to this component's own [disabled] input. Before the fix
 * the template never bound the underlying <input>'s disabled property at
 * all, so a read-only address still rendered an editable, model-mutating
 * typeahead.
 */
describe('AddressValidatorComponent [disabled]', () => {
  let fixture: ComponentFixture<DisabledAddressValidatorHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisabledAddressValidatorHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DisabledAddressValidatorHostComponent);
    fixture.detectChanges();
  });

  it('renders the underlying <input> as disabled', () => {
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);

    // NOT asserted here: that typing into the field is blocked. In jsdom,
    // input.dispatchEvent(new Event('input')) runs listeners regardless of
    // the disabled property - dispatchEvent is programmatic, and only a real
    // browser refuses to fire 'input' on a disabled control in the first
    // place. input.disabled === true is the guarantee jsdom can verify; the
    // stronger "typing does nothing" claim is a browser guarantee, not one
    // this suite can exercise.
  });
});

describe('AddressValidatorComponent with no serviceUrl', () => {
  let component: AddressValidatorComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressValidatorComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // TypeaheadContainerComponent animates its dropdown with a synthetic
        // @typeaheadAnimation property, which needs an animations provider.
        provideNoopAnimations(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AddressValidatorComponent);
    component = fixture.componentInstance;
    // ngOnInit builds typeaheadList$ from searchText$.
    fixture.detectChanges();
  });

  afterEach(() => {
    // With no URL there is nothing to request. verify() fails loudly if the
    // component opened one anyway.
    httpMock.verify();
  });

  it('emits an empty result list and leaves the field out of the error state', fakeAsync(() => {
    expect(component.serviceUrl).toBeUndefined();

    const emissions: AddressResult[][] = [];
    component.typeaheadList$.subscribe((results) => emissions.push(results));

    // onKeyUp no longer feeds searchText$ (that moved to onInput, fed by the
    // native 'input' event - see address-validator.component.ts). This spec
    // reaches into the component's own API rather than the DOM elsewhere in
    // this describe block (component.search, a direct subscription to
    // typeaheadList$), so driving onInput() with a hand-rolled event keeps
    // that same level, rather than mixing in a rendered <input>.
    component.search = '101';
    component.onInput({
      target: { value: component.search },
    } as unknown as Event);
    tick(500);

    expect(emissions).toEqual([[]]);
    expect(component.hasError).toBe(false);

    // catchError unsubscribes from the source, so an error on the first
    // search would also silence every search after it. A second, distinct
    // term has to still reach the subscriber.
    component.search = '1012';
    component.onInput({
      target: { value: component.search },
    } as unknown as Event);
    tick(500);

    expect(emissions).toEqual([[], []]);
    expect(component.hasError).toBe(false);
  }));
});

/**
 * The API response, in the shape ADDRESS_URL returns: an `Address` array of
 * features. processResponse() picks these fields off of each one.
 */
const API_RESPONSE = {
  Address: [
    {
      AddressComplete: '1012 Douglas St, Victoria, BC',
      HouseNumber: '1012',
      SubBuilding: '',
      Street: 'Douglas St',
      Locality: 'Victoria',
      DeliveryAddressLines: '1012 Douglas St',
      AddressLines: ['1012 Douglas St', 'Victoria BC'],
      Country: 'CAN',
      Province: 'BC',
      PostalCode: 'V8W 2C6',
    },
  ],
};

@Component({
  template: `
    <form [formGroup]="form">
      <common-address-validator
        formControlName="address"
        [serviceUrl]="serviceUrl"
        (select)="selected = $event"></common-address-validator>
    </form>
  `,
  imports: [ReactiveFormsModule, AddressValidatorComponent],
})
class TypeaheadReactiveHostComponent {
  @ViewChild(AddressValidatorComponent)
  addressComponent!: AddressValidatorComponent;
  form = new FormGroup({ address: new FormControl('') });
  serviceUrl = 'https://example.test/geocoder/addresses.json';
  selected: Address | null = null;
}

/**
 * Renders the component with a real [serviceUrl], through the rendered
 * TypeaheadDirective rather than by subscribing to typeaheadList$ directly.
 * Models the shape of the geocoder tests in street.component.spec.ts.
 */
describe('AddressValidatorComponent typeahead lookup, enabled path', () => {
  let fixture: ComponentFixture<TypeaheadReactiveHostComponent>;
  let host: TypeaheadReactiveHostComponent;
  let httpMock: HttpTestingController;

  // fakeAsync rather than an async beforeEach: the component's own
  // [(ngModel)]="search" resolves its first registration through a shared,
  // module-level Promise.resolve().then(...) inside @angular/forms, the same
  // reason street.component.spec.ts uses fakeAsync for its geocoder setup.
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [TypeaheadReactiveHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // TypeaheadContainerComponent animates its dropdown with a synthetic
        // @typeaheadAnimation property, which needs an animations provider.
        provideNoopAnimations(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TypeaheadReactiveHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    tick();
  }));

  afterEach(() => {
    httpMock.verify();
  });

  function addressInput(): HTMLInputElement {
    return fixture.debugElement
      .query(By.directive(AddressValidatorComponent))
      .nativeElement.querySelector('input');
  }

  /** Only valid inside fakeAsync: the tick(0) between the two events matters,
   * mirroring typeIntoGeocoderInput in street.component.spec.ts. The
   * TypeaheadDirective itself listens for 'input' and, after its own
   * zero-delay debounce, subscribes to the [typeahead] observable; the
   * component's own (keyup) binding is what actually pushes the search term
   * into its 500ms debounce. */
  function typeIntoAddressInput(value: string): HTMLInputElement {
    const input = addressInput();
    input.value = value;
    input.dispatchEvent(new Event('input'));
    tick(0);
    input.dispatchEvent(typedKeyUp());
    return input;
  }

  it('renders the typeahead-bound input, not a plain one', () => {
    const addressDe = fixture.debugElement.query(
      By.directive(AddressValidatorComponent)
    );
    const inputs = addressDe.queryAll(By.css('input'));

    expect(inputs.length).toBe(1);
    expect(inputs[0].injector.get(TypeaheadDirective, null)).toBeTruthy();
  });

  it('requests the geocoder with the built URL and params, shows AddressComplete in the option, writes the selection to the bound control and emits the parsed address', fakeAsync(() => {
    typeIntoAddressInput('1012 Doug');
    tick(500);

    const req = httpMock.expectOne(
      (r) =>
        r.url === host.serviceUrl && r.params.get('address') === '1012 Doug'
    );
    expect(req.request.method).toBe('GET');
    req.flush(API_RESPONSE);

    tick();
    fixture.detectChanges();

    const option: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button.dropdown-item') ??
      document.querySelector('button.dropdown-item');
    expect(option).toBeTruthy();
    expect(option!.textContent).toContain('1012 Douglas St, Victoria, BC');

    option!.click();
    fixture.detectChanges();
    // TypeaheadContainerComponent.selectMatch defers typeaheadOnSelect by a
    // setTimeout, so (select) has not fired yet at this point.
    expect(host.selected).toBeNull();

    tick();
    fixture.detectChanges();

    expect(host.selected).toBeTruthy();
    expect(host.selected!.street).toBe('1012 Douglas St');
    expect(host.selected!.streetNumber).toBe('1012');
    expect(host.selected!.streetName).toBe('Douglas St');
    expect(host.selected!.city).toBe('Victoria');
    expect(host.selected!.province).toBe('BC');
    expect(host.selected!.country).toBe('CAN');
    expect(host.selected!.postal).toBe('V8W 2C6');

    // onSelect always writes the stripped street through to the outer form
    // control, whether or not populateAddressOnSelect is set.
    expect(host.form.get('address')!.value).toBe('1012 Douglas St');

    // The typeahead container leaves a pending timer behind while it is
    // open; destroying the fixture disposes the component loader so the
    // fakeAsync zone drains cleanly.
    fixture.destroy();
    tick();
  }));

  // Item 3 of the 2.2.0 fix: the lookup pipeline is fed from the native
  // 'input' event (onInput), not from (keyup). The four cases below are the
  // guard for that.

  it('paste path: a native "input" event with no keyup at all still triggers exactly one request', fakeAsync(() => {
    const input = addressInput();
    input.value = '1012 Doug';
    input.dispatchEvent(new Event('input'));
    tick(500);

    const reqs = httpMock.match(
      (r) =>
        r.url === host.serviceUrl && r.params.get('address') === '1012 Doug'
    );
    expect(reqs.length).toBe(1);
    reqs.forEach((r) => r.flush(API_RESPONSE));
    tick();

    fixture.destroy();
    tick();
  }));

  it('a normal keystroke - "input" then "keyup" - triggers exactly one request, not two', fakeAsync(() => {
    typeIntoAddressInput('1012 Doug');
    tick(500);

    const reqs = httpMock.match(
      (r) =>
        r.url === host.serviceUrl && r.params.get('address') === '1012 Doug'
    );
    expect(reqs.length).toBe(1);
    reqs.forEach((r) => r.flush(API_RESPONSE));
    tick();

    fixture.destroy();
    tick();
  }));

  it('Enter or Tab with no preceding "input" event triggers no request', fakeAsync(() => {
    const input = addressInput();
    input.dispatchEvent(keyUpWithCode(13)); // enter
    input.dispatchEvent(keyUpWithCode(9)); // tab
    tick(500);

    const reqs = httpMock.match(() => true);
    expect(reqs.length).toBe(0);
  }));

  it('choosing a suggestion by clicking it triggers no additional request and the dropdown does not reopen', fakeAsync(() => {
    typeIntoAddressInput('1012 Doug');
    tick(500);

    const req = httpMock.expectOne(
      (r) =>
        r.url === host.serviceUrl && r.params.get('address') === '1012 Doug'
    );
    req.flush(API_RESPONSE);
    tick();
    fixture.detectChanges();

    const option: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button.dropdown-item') ??
      document.querySelector('button.dropdown-item');
    expect(option).toBeTruthy();

    option!.click();
    fixture.detectChanges();
    // TypeaheadContainerComponent.selectMatch's viewToModelUpdate + deferred
    // typeaheadOnSelect setTimeout(0).
    tick();
    fixture.detectChanges();

    // Give the 500ms debounce window a stray searchText$ emission would need
    // to reach a lookup, then confirm nothing new was requested.
    tick(500);
    fixture.detectChanges();

    httpMock.expectNone((r) => r.url === host.serviceUrl);

    const reopened: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('button.dropdown-item') ??
      document.querySelector('button.dropdown-item');
    expect(reopened).toBeFalsy();

    fixture.destroy();
    tick();
  }));
});
