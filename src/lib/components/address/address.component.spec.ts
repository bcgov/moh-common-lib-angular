import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AddressComponent } from './address.component';
import { StreetComponent } from '../street/street.component';
import { Address } from '../../models/address.model';
import { GeoAddressResult } from '../../services/geocoder.service';
import { CANADA, COUNTRY_LIST } from '../country/country.component';
import {
  BRITISH_COLUMBIA,
  PROVINCE_LIST,
  ProvinceComponent,
  ProvinceList,
} from '../province/province.component';

@Component({
  template: `
    <form [formGroup]="form">
      <common-address [(address)]="address"></common-address>
    </form>
  `,
  imports: [ReactiveFormsModule, AddressComponent],
})
class ReactiveAddressHostComponent {
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  form = new FormGroup({});
  address = Object.assign(new Address(), { city: 'Victoria' });
}

function createComponent() {
  const fixture = TestBed.createComponent(AddressComponent);
  const component = fixture.componentInstance;
  // Provide a minimal Address so ngOnInit doesn't error on undefined addr
  component['addr'] = new Address();
  return { fixture, component };
}

describe('AddressComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressComponent, FormsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const { component } = createComponent();
    expect(component).toBeTruthy();
  });

  it('should default to Canada as country', () => {
    const { component } = createComponent();
    component.countryList = COUNTRY_LIST;
    component.defaultCountry = CANADA;
    component.provinceList = PROVINCE_LIST;
    const addr = new Address();
    addr.country = '';
    component['addr'] = addr;
    component.setCountry(CANADA);
    expect(component['addr'].country).toBe(CANADA);
  });

  it('isCanada() should return true when country is Canada', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    component['addr'].country = CANADA;
    expect(component.isCanada()).toBe(true);
  });

  it('isCanada() should return false for non-Canadian addresses', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    component['addr'].country = 'US';
    expect(component.isCanada()).toBe(false);
  });

  it('useAddressValidator should return false when disableGeocoder is true', () => {
    const { component } = createComponent();
    component.disableGeocoder = true;
    component['addr'] = new Address();
    component['addr'].country = CANADA;
    expect(component.useAddressValidator).toBe(false);
  });

  it('useAddressValidator should return true for Canadian addresses with geocoder enabled', () => {
    const { component } = createComponent();
    component.disableGeocoder = false;
    component['addr'] = new Address();
    component['addr'].country = CANADA;
    expect(component.useAddressValidator).toBe(true);
  });

  it('setProvince() should update addr.province and emit addressChange', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    jest.spyOn(component.addressChange, 'emit');
    component.setProvince(BRITISH_COLUMBIA);
    expect(component['addr'].province).toBe(BRITISH_COLUMBIA);
    expect(component.addressChange.emit).toHaveBeenCalled();
  });

  it('setPostalCode() should update addr.postal', () => {
    const { component } = createComponent();
    component['addr'] = new Address();
    component.setPostalCode('V8V 1A1');
    expect(component['addr'].postal).toBe('V8V 1A1');
  });

  it('addLine() should show line 2 first', () => {
    const { component } = createComponent();
    component.addLine();
    expect(component.showLine2).toBe(true);
    expect(component.showLine3).toBe(false);
  });

  it('addLine() should show line 3 after line 2', () => {
    const { component } = createComponent();
    component.showLine2 = true;
    component.addLine();
    expect(component.showLine3).toBe(true);
  });

  it('removeLine() should hide the specified line', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.addressLine2 = '  Apt 2';
    component['addr'] = addr;
    component.showLine2 = true;
    component.removeLine(2);
    expect(component.showLine2).toBe(false);
  });

  it('writeValue() should set addr when value is provided', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.city = 'Victoria';
    component.writeValue(addr);
    expect(component['addr'].city).toBe('Victoria');
  });

  it('setStreetAddress() should clear related fields when value is empty', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.city = 'Victoria';
    addr.postal = 'V8V 1A1';
    component['addr'] = addr;
    component.disableGeocoder = false;
    component.setStreetAddress('');
    expect(component['addr'].city).toBe('');
    expect(component['addr'].postal).toBe('');
  });
});

// AddressComponent declares the same viewProviders alias of ControlContainer
// to NgForm that FileUploaderComponent had to make conditional in 2.1.1, but
// it does not need the same fix. Every ngModel in the address view does ask
// for the token: NgModel's factory declares
// deps: [{ token: ControlContainer, host: true, optional: true }, ...]. So
// the alias is resolved, and what differs is what it resolves to. Inside a
// template-driven host each field's parent comes back as the host's NgForm.
// Inside a reactive host there is no NgForm to alias to and the optional
// injection yields null rather than throwing. This test guards that a
// reactive host still renders.
describe('AddressComponent inside a reactive form', () => {
  let fixture: ComponentFixture<ReactiveAddressHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveAddressHostComponent, AddressComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReactiveAddressHostComponent);
  });

  it('should render without throwing when used inside a reactive [formGroup] host', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

/**
 * StreetComponent declares `@Output() select`, so the address template has to
 * listen for `select`. An earlier `(selectEvent)` binding compiled fine - an
 * unmatched output on a component element just becomes a DOM event listener -
 * and silently dropped every geocoder selection.
 */
@Component({
  template: `
    <form>
      <common-address
        [(address)]="address"
        [disableGeocoder]="true"></common-address>
    </form>
  `,
  imports: [FormsModule, AddressComponent],
})
class StreetSelectAddressHostComponent {
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  address = Object.assign(new Address(), {
    country: CANADA,
    province: BRITISH_COLUMBIA,
  });
}

describe('AddressComponent street selection', () => {
  let fixture: ComponentFixture<StreetSelectAddressHostComponent>;
  let host: StreetSelectAddressHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetSelectAddressHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StreetSelectAddressHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('copies a geocoder selection into the address when common-street emits select', () => {
    const streetDe = fixture.debugElement.query(By.directive(StreetComponent));
    expect(streetDe).toBeTruthy();

    const selection: GeoAddressResult = {
      fullAddress: '1012 Douglas St, Victoria, BC',
      street: '1012 Douglas St',
      city: 'Victoria',
      province: BRITISH_COLUMBIA,
      country: CANADA,
    };

    const emitted: Address[] = [];
    host.addressComponent.addressChange.subscribe((a) => emitted.push(a));

    (streetDe.componentInstance as StreetComponent).select.emit(selection);
    fixture.detectChanges();

    const addr = host.addressComponent.address;
    expect(addr.addressLine1).toBe('1012 Douglas St');
    expect(addr.city).toBe('Victoria');
    expect(addr.province).toBe(BRITISH_COLUMBIA);
    expect(addr.country).toBe(CANADA);
    expect(emitted.length).toBe(1);
  });
});

/**
 * NG_VALUE_ACCESSOR is a multi-provider token. Registering AddressComponent
 * against it without `multi: true` makes @angular/forms read a single object
 * where it expects an array of accessors, and the control never binds.
 *
 * The [address] input is deliberate and not incidental: AddressComponent's
 * ngOnInit calls updateProvList(), which dereferences this.addr, and it runs
 * before FormControlName's writeValue lands. Seeding addr through the input
 * setter (which runs in the component's own ngOnChanges, ahead of its
 * ngOnInit) keeps this test on the value-accessor question. The unseeded case
 * has its own host and its own tests further down.
 */
@Component({
  template: `
    <form [formGroup]="form">
      <common-address
        formControlName="address"
        [address]="seed"
        [disableGeocoder]="true"></common-address>
    </form>
  `,
  imports: [ReactiveFormsModule, AddressComponent],
})
class FormControlAddressHostComponent {
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  seed = Object.assign(new Address(), { country: CANADA });
  form = new FormGroup({
    address: new FormControl<Address>(
      Object.assign(new Address(), {
        addressLine1: '1012 Douglas St',
        city: 'Victoria',
        province: BRITISH_COLUMBIA,
        country: CANADA,
      }),
      { nonNullable: true }
    ),
  });
}

describe('AddressComponent as a form control', () => {
  let fixture: ComponentFixture<FormControlAddressHostComponent>;
  let host: FormControlAddressHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlAddressHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlAddressHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('reads the control value through writeValue', () => {
    // The seed carries no city, so a city here can only have come from the
    // control value being written into the component.
    expect(host.seed.city).toBeFalsy();
    expect(host.addressComponent.address.city).toBe('Victoria');
    expect(host.addressComponent.address.addressLine1).toBe('1012 Douglas St');
  });

  it('writes edits back out to the bound control', () => {
    const control = host.form.controls.address;
    const emissions: Address[] = [];
    control.valueChanges.subscribe((v) => emissions.push(v));

    host.addressComponent.setCity('Vancouver');
    fixture.detectChanges();

    expect(emissions.length).toBe(1);
    expect(emissions[0].city).toBe('Vancouver');
    expect(control.value.city).toBe('Vancouver');
  });
});

/**
 * The same formControlName binding with no [address] seed, which is how a
 * consumer that only uses reactive forms would write it. AddressComponent's
 * ngOnInit runs before FormControlName's writeValue delivers the address, so
 * updateProvList() is reached with addr still undefined and has to bail out
 * rather than dereference it.
 */
@Component({
  template: `
    <form [formGroup]="form">
      <common-address
        formControlName="address"
        [disableGeocoder]="true"></common-address>
    </form>
  `,
  imports: [ReactiveFormsModule, AddressComponent],
})
class UnseededFormControlAddressHostComponent {
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  form = new FormGroup({
    address: new FormControl<Address>(
      Object.assign(new Address(), {
        addressLine1: '1012 Douglas St',
        city: 'Victoria',
        province: BRITISH_COLUMBIA,
        country: CANADA,
      }),
      { nonNullable: true }
    ),
  });
}

describe('AddressComponent as a form control with no [address] seed', () => {
  let fixture: ComponentFixture<UnseededFormControlAddressHostComponent>;
  let host: UnseededFormControlAddressHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnseededFormControlAddressHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnseededFormControlAddressHostComponent);
    host = fixture.componentInstance;
  });

  it('renders without throwing when ngOnInit runs before writeValue', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('still picks up the control value once writeValue lands', () => {
    fixture.detectChanges();

    expect(host.addressComponent.address.addressLine1).toBe('1012 Douglas St');
    expect(host.addressComponent.address.city).toBe('Victoria');
  });

  it('fills the province dropdown once writeValue lands', () => {
    fixture.detectChanges();

    const provinceDe = fixture.debugElement.query(
      By.directive(ProvinceComponent)
    );
    expect(provinceDe).toBeTruthy();

    // Assert through the rendered dropdown, not just provList. An undefined
    // provList is not an inert no-op: [provinceList]="provList" overrides
    // ProvinceComponent's own PROVINCE_LIST default, so the user is left with
    // an ng-select holding zero options while the control already says BC.
    const selectDe = provinceDe.query(By.directive(NgSelectComponent));
    expect(selectDe).toBeTruthy();

    const select = selectDe.componentInstance as NgSelectComponent;
    const codes = select.itemsList.items.map(
      (item) => (item.value as ProvinceList).provinceCode
    );

    expect(codes).toEqual(PROVINCE_LIST.map((prov) => prov.provinceCode));
    expect(codes).toContain(BRITISH_COLUMBIA);
    expect(host.addressComponent.provList.length).toBe(PROVINCE_LIST.length);
  });
});
