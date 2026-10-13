import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AddressComponent } from './address.component';
import { StreetComponent } from '../street/street.component';
import { AddressValidatorComponent } from '../address-validator/address-validator.component';
import { Address } from '../../models/address.model';
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

  it('setStreetAddress() should clear related fields when value is empty and the address validator is the street field', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.city = 'Victoria';
    addr.postal = 'V8V 1A1';
    addr.province = 'AB';
    addr.country = CANADA;
    component['addr'] = addr;
    component.disableGeocoder = false;
    expect(component.useAddressValidator).toBe(true);
    component.setStreetAddress('');
    expect(component['addr'].city).toBe('');
    expect(component['addr'].postal).toBe('');
    expect(component['addr'].province).toBe(BRITISH_COLUMBIA);
    expect(component['addr'].country).toBe(CANADA);
  });

  it('setStreetAddress() should leave every other field alone when value is empty outside Canada', () => {
    const { component } = createComponent();
    const addr = new Address();
    addr.addressLine1 = '1 Calle Uno';
    addr.city = 'Santiago';
    addr.postal = '8320000';
    addr.province = 'Region Metropolitana';
    addr.country = 'CHL';
    component['addr'] = addr;
    component.disableGeocoder = false;
    expect(component.useAddressValidator).toBe(false);
    component.setStreetAddress('');
    expect(component['addr'].addressLine1).toBe('');
    expect(component['addr'].city).toBe('Santiago');
    expect(component['addr'].postal).toBe('8320000');
    expect(component['addr'].province).toBe('Region Metropolitana');
    expect(component['addr'].country).toBe('CHL');
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
 * The address-validator branch of address.component.html
 * (*ngIf="useAddressValidator") renders
 * <common-address-validator name="street_{{ objectId }}" [(ngModel)]="...">,
 * which registers a real control on the ambient NgForm that
 * AddressComponent's viewProviders alias ControlContainer to
 * (address.component.ts:107-109).
 *
 * NOT RED-GREEN FOR [ngModelOptions] - see the handoff in Amber's report.
 * The dispatch packet's theory was that AddressValidatorComponent's own
 * inner template ngModel (its display-only search box) also resolves that
 * same ambient NgForm via @Host(), registering a second, spurious control -
 * "address-validator_{{ label }}" - unless [ngModelOptions]="{ standalone:
 * true }" keeps it out. Measured: reverting only that one attribute and
 * re-running this exact test produces the SAME five keys, no leak, either
 * way - AddressValidatorComponent declares no viewProviders of its own, so
 * ControlContainer resolves null for its inner template's ngModel
 * regardless of the outer alias, and [ngModelOptions] is a no-op on this
 * specific path. This test is kept as a real, currently-true regression
 * assertion (no leaked control exists today), not as proof the reverted
 * line is what keeps it that way.
 */
@Component({
  template: `
    <form>
      <common-address [address]="seed"></common-address>
    </form>
  `,
  imports: [FormsModule, AddressComponent],
})
class TemplateFormAddressValidatorHostComponent {
  @ViewChild(NgForm) ngForm!: NgForm;
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  seed = Object.assign(new Address(), {
    country: CANADA,
    province: BRITISH_COLUMBIA,
    city: 'Victoria',
  });
}

describe('AddressComponent inside a template-driven form, with the address validator active', () => {
  let fixture: ComponentFixture<TemplateFormAddressValidatorHostComponent>;
  let host: TemplateFormAddressValidatorHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateFormAddressValidatorHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      TemplateFormAddressValidatorHostComponent
    );
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not register the display-only address-validator search box as a second control on the ambient NgForm', () => {
    // Sanity: the address-validator branch is actually the one rendering
    // (not common-street), so this is exercising the path in question.
    expect(host.addressComponent.useAddressValidator).toBe(true);
    expect(
      fixture.nativeElement.querySelector('common-address-validator input')
    ).toBeTruthy();

    const keys = Object.keys(host.ngForm.controls);

    // Sanity: the real control from
    // <common-address-validator name="street_{{ objectId }}"
    // [(ngModel)]="addr.addressLine1"> is present.
    expect(keys.some((k) => k.startsWith('street_'))).toBe(true);

    const leaked = keys.filter((k) => k.startsWith('address-validator_'));
    expect(leaked).toEqual([]);
  });
});

/**
 * With the address validator active, a suggestion picked in the search box
 * reaches the address through the template's (select) listener on
 * common-address-validator. common-street is not rendered in this state.
 */
@Component({
  template: `
    <form>
      <common-address [(address)]="address"></common-address>
    </form>
  `,
  imports: [FormsModule, AddressComponent],
})
class ValidatorSelectAddressHostComponent {
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  address = Object.assign(new Address(), {
    country: CANADA,
    province: BRITISH_COLUMBIA,
  });
}

describe('AddressComponent suggestion selection', () => {
  let fixture: ComponentFixture<ValidatorSelectAddressHostComponent>;
  let host: ValidatorSelectAddressHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidatorSelectAddressHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidatorSelectAddressHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('copies a suggestion into the address when common-address-validator emits select', () => {
    const validatorDe = fixture.debugElement.query(
      By.directive(AddressValidatorComponent)
    );
    expect(validatorDe).toBeTruthy();
    expect(
      fixture.debugElement.query(By.directive(StreetComponent))
    ).toBeNull();

    const selection = Object.assign(new Address(), {
      addressLine1: '1012 Douglas St',
      city: 'Calgary',
      province: 'AB',
      country: CANADA,
      postal: 'T2P 1A1',
    });

    const emitted: Address[] = [];
    host.addressComponent.addressChange.subscribe((a) => emitted.push(a));

    (validatorDe.componentInstance as AddressValidatorComponent).select.emit(
      selection
    );
    fixture.detectChanges();

    const addr = host.addressComponent.address;
    expect(addr.city).toBe('Calgary');
    expect(addr.province).toBe('AB');
    expect(addr.postal).toBe('T2P 1A1');
    expect(addr.country).toBe(CANADA);
    // Two emits: setCity (via the city component's onValueChange), then
    // selectSuggestedAddress itself with the complete address.
    expect(emitted.length).toBe(2);
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

/**
 * A complete address outside Canada, rendered with the address validator
 * disabled by the country (common-street is the street field). Required is on,
 * as in the DEAM School Address.
 */
@Component({
  template: `
    <form>
      <common-address [address]="address" [isRequired]="true"></common-address>
    </form>
  `,
  imports: [FormsModule, AddressComponent],
})
class NonCanadianAddressHostComponent {
  @ViewChild(NgForm) ngForm!: NgForm;
  @ViewChild(AddressComponent) addressComponent!: AddressComponent;
  address = Object.assign(new Address(), {
    addressLine1: '1 Calle Uno',
    city: 'Santiago',
    province: 'Region Metropolitana',
    country: 'CHL',
    postal: '8320000',
  });
}

describe('AddressComponent outside Canada, rendered', () => {
  let fixture: ComponentFixture<NonCanadianAddressHostComponent>;
  let host: NonCanadianAddressHostComponent;

  function streetInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('common-street input');
  }

  function controlValue(prefix: string) {
    const key = Object.keys(host.ngForm.controls).find((k) =>
      k.startsWith(prefix)
    );
    expect(key).toBeDefined();
    return host.ngForm.controls[key!];
  }

  async function render() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonCanadianAddressHostComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NonCanadianAddressHostComponent);
    host = fixture.componentInstance;
    await render();
  });

  it('starts valid with no required errors', () => {
    // Sanity: the plain street field is the one rendering, and the starting
    // point of the tests below is a complete, error-free address.
    expect(host.addressComponent.useAddressValidator).toBe(false);
    expect(streetInput()).toBeTruthy();
    host.ngForm.form.markAllAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('is required.');
    expect(host.ngForm.valid).toBe(true);
  });

  it('keeps the address when text is selected in the street input', async () => {
    // Selecting text in an input fires a native `select` event that bubbles to
    // the common-street host. With a (select) listener on common-street in the
    // address template, this test fails (addressLine1 is undefined).
    streetInput().dispatchEvent(new Event('select', { bubbles: true }));
    await render();
    host.ngForm.form.markAllAsTouched();
    fixture.detectChanges();

    const addr = host.addressComponent.address;
    expect(addr.addressLine1).toBe('1 Calle Uno');
    expect(addr.city).toBe('Santiago');
    expect(addr.province).toBe('Region Metropolitana');
    expect(addr.country).toBe('CHL');
    expect(addr.postal).toBe('8320000');

    // The control values are what the required validator reads.
    expect(controlValue('street_').value).toBe('1 Calle Uno');
    expect(controlValue('city_').value).toBe('Santiago');
    expect(controlValue('province_').value).toBe('Region Metropolitana');
    expect(controlValue('country_').value).toBe('CHL');
    expect(fixture.nativeElement.textContent).not.toContain('is required.');
    expect(host.ngForm.valid).toBe(true);
  });

  it('shows the required error on the street only when the street is cleared', async () => {
    const input = streetInput();
    input.value = '';
    input.dispatchEvent(new Event('change'));
    await render();
    host.ngForm.form.markAllAsTouched();
    fixture.detectChanges();

    const addr = host.addressComponent.address;
    expect(addr.addressLine1).toBe('');
    expect(addr.city).toBe('Santiago');
    expect(addr.province).toBe('Region Metropolitana');
    expect(addr.country).toBe('CHL');
    expect(addr.postal).toBe('8320000');

    expect(controlValue('street_').errors?.['required']).toBeTruthy();
    expect(controlValue('city_').errors).toBeNull();
    expect(controlValue('province_').errors).toBeNull();
    expect(controlValue('country_').errors).toBeNull();
    expect(controlValue('pc_').errors).toBeNull();

    const errors = fixture.nativeElement.querySelectorAll(
      'common-error-container'
    );
    const shown = Array.from<HTMLElement>(errors)
      .map((e) => e.textContent!.trim())
      .filter((t) => t.length > 0);
    expect(shown.length).toBe(1);
    expect(shown[0]).toContain('is required.');
    expect(
      fixture.nativeElement
        .querySelector('common-street')
        .textContent.includes('is required.')
    ).toBe(true);
  });
});
