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

/** A keyup that onKeyUp does not filter out (not enter, not tab). */
function typedKeyUp(): KeyboardEvent {
  const event = new KeyboardEvent('keyup', { bubbles: true });
  Object.defineProperty(event, 'keyCode', { get: () => 83 });
  return event;
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

    component.search = '101';
    component.onKeyUp(typedKeyUp());
    tick(500);

    expect(emissions).toEqual([[]]);
    expect(component.hasError).toBe(false);

    // catchError unsubscribes from the source, so an error on the first
    // search would also silence every search after it. A second, distinct
    // term has to still reach the subscriber.
    component.search = '1012';
    component.onKeyUp(typedKeyUp());
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
});
